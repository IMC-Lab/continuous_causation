library(tidyverse)

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
    write_csv('../data/experiment1_learning.csv')


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
    write_csv('../data/experiment1_judgments.csv')
