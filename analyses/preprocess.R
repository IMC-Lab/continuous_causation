library(tidyverse)

d <- list.files('data/experiment1/', full.names=TRUE) %>%
    read_csv() %>%
    mutate(measure=ifelse(!is.na(trial), 'learning', measure)) %>%
    filter(!is.na(measure))


d.learning <- d %>%
    filter(measure %in% c('learning', 'manipulation_check')) %>%
    group_by(id) %>%
    mutate(average_c=last(response_c), average_a=last(response_a)) %>%
    filter(measure != 'manipulation_check') %>%
    group_by(prolific_id, id, average_c, average_a) %>%
    count() %>%
    transmute(n_incorrect=n-20)

## randomly select bonus winners
bonus_c <- d.learning %>% ungroup %>%
    filter(average_c==10) %>%
    sample_n(size=10) %>%
    pull(prolific_id)
bonus_a <- d.learning %>% ungroup %>%
    filter(average_a==10) %>%
    sample_n(size=10) %>%
    pull(prolific_id)
tibble(id=c(bonus_c, bonus_a), bonus=2.00) %>%
    group_by(id) %>%
    summarize(bonus=sum(bonus)) %>%
    write_csv('data/bonus.csv')

## format to one row per participant and save to file
d %>%
    filter(measure != 'learning', measure != 'manipulation_check') %>%
    group_by(id) %>%
    select(id, mu_c:valence, measure, response, rt) %>%
    pivot_wider(names_from=measure, values_from=c(response, rt)) %>%
    left_join(d.learning, by=c('id', 'prolific_id')) %>%
    select(-prolific_id) %>%
    select(-c(rt_justification:rt_comments)) %>%
    rename_with(~ str_remove(., 'response_'), response_judgment:response_comments) %>%
    rename(cause=judgment, vignette=name) %>%
    mutate(cause=as.numeric(cause),
           confidence=as.numeric(confidence),
           age=as.numeric(age)) %>%
    write_csv('data/experiment1.csv')



### Test
d <- list.files('data/experiment1/', full.names=TRUE) %>%
    read_csv(id='filename') %>%
    ##mutate(measure=ifelse(!is.na(trial) & is.na(measure), 'learning', measure)) %>%
    filter(!is.na(measure)) %>%
    group_by(id) %>%
    mutate(duration_mins=(last(time_elapsed)-first(time_elapsed))/1000/60) %>%
    ungroup()

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
    write_csv('data/experiment1_learning.csv')


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
    write_csv('data/experiment1_judgments.csv')
