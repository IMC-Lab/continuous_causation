library(tidyverse)

setwd("/Users/kmiceli98/Library/CloudStorage/Box-Box/Grad_School/Research/Projects/Causation")

# d <- tibble(files=list.files('experiment2', full.names=TRUE)) %>%
#   mutate(group=row_number() %% 6) %>%
#   group_by(group) %>%
#   nest(filenames=files) %>%
#   mutate(data=map(filenames, ~ read_csv(.$files)))
#   
# d <- d %>% unnest(data) %>%
#   ungroup() %>%
#   select(-group, -filenames)
# 
# d <- list.files('experiment2', full.names=TRUE) %>%
#     read_csv(progress=TRUE, lazy=TRUE) %>%
#     mutate(measure=ifelse(!is.na(trial), 'learning', measure)) %>%
#     filter(!is.na(measure))

d <- list.files('experiment2', full.names=TRUE) %>%
  read_csv()
  #mutate(measure=ifelse(!is.na(trial), 'learning', measure)) %>%
 # filter(!is.na(measure))

## format to one row per participant and save to file
d %>%
    filter(measure != 'learning', measure != 'manipulation_check') %>%
    group_by(id) %>%
    select(id, mu_c:valence, measure, response, rt) %>%
    pivot_wider(names_from=measure, values_from=c(response, rt)) %>%
    left_join(d.learning, by=c('id')) %>%
   # select(-prolific_id) %>%
    select(-c(rt_justification:rt_comments)) %>%
    rename_with(~ str_remove(., 'response_'), response_judgment:response_comments) %>%
    rename(cause=judgment) %>%
    mutate(cause=as.numeric(cause),
           confidence=as.numeric(confidence),
           age=as.numeric(age)) %>%
    write_csv('experiment2.csv')
test<- read_csv('experiment2.csv')
names(test)

d.manipulation_check <- d %>%
    filter(measure == 'manipulation_check') %>%
    select(id, mu_c:valence, block, measure, variable, response) %>%
    mutate(response=as.numeric(response)) %>%
    pivot_wider(names_from=c(measure, variable), values_from=response)

d.learning <- d %>%
    filter(measure == 'learning') %>%
    group_by(id, block, trial) %>%
    summarize(n=n(), rt=last(rt)) %>%
    mutate(n_incorrect=n-1) %>%
    select(-n) %>%
    left_join(d.manipulation_check)

d.learning %>%
    select(-prolific_id) %>%
    rename(vignette=name) %>%
    write_csv('experiment2_learning.csv')


## format to one row per participant and save to file
d <- d %>%
    filter(measure != 'learning', measure != 'manipulation_check') %>%
    group_by(id) %>%
    select(id, mu_c:valence, measure, variable, response, rt) %>%
    group_by(id, measure, variable) %>%
    filter(row_number() == 1) %>%
    unite(measure, measure, variable) %>%
    mutate(measure=str_remove(measure, '_NA')) %>%
    pivot_wider(names_from=measure, values_from=c(response, rt)) %>%
    select(-prolific_id, -study_id, -session_id) %>%
    select(-c(rt_justification:rt_comments)) %>%
    rename_with(~ str_remove(., 'response_'), response_judgment:response_comments) %>%
    rename(cause=judgment, vignette=name) %>%
    mutate(cause=as.numeric(cause),
           confidence=as.numeric(confidence),
           age=as.numeric(age)) %>%
    write_csv('experiment2_judgments.csv')


d %>%
  group_by(mu_c, threshold) %>%
  summarize(cause=mean(cause), confidence=mean(confidence))

ggplot(d, aes(x=mu_c, y=cause)) +
  geom_violin(aes(group=mu_c)) +
  stat_summary(fun.data=mean_se) +
  facet_wrap(~ threshold) +
  ylim(0, 1) +
  theme_classic()
