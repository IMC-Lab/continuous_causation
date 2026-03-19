library(tidyverse)

d <- list.files("../data/experiment2", full.names = TRUE) |>
  read_csv() |>
  filter(!is.na(measure)) |>
  select(-c(prolific_id:session_id)) |>
  rename(vignette=name)
print(d)

d.manipulation_check <- d |>
  filter(measure == 'manipulation_check') |>
  select(id, mu_c:valence, block, measure, variable, response) |>
  mutate(response=as.numeric(response)) |>
  pivot_wider(names_from=c(measure, variable), values_from=response)

d.learning <- d |>
  filter(measure == 'learning') |>
  group_by(id, block, trial) |>
  summarize(n=n(), rt=last(rt)) |>
  mutate(n_incorrect=n-1) |>
  select(-n) |>
  left_join(d.manipulation_check)

d.learning |>
  write_csv('../data/experiment2_learning.csv')


## format to one row per participant and save to file
d.judgments <- d |>
  filter(measure != 'learning', measure != 'manipulation_check') |>
  group_by(id) |>
  select(id, mu_c:valence, measure, variable, response, rt) |>
  group_by(id, measure, variable) |>
  filter(row_number() == 1) |>
  unite(measure, measure, variable) |>
  mutate(measure=str_remove(measure, '_NA')) |>
  pivot_wider(names_from=measure, values_from=c(response, rt)) |>
  select(-c(rt_justification:rt_comments)) |>
  rename_with(~ str_remove(., 'response_'), starts_with('response')) |>
  rename(cause=judgment) |>
  mutate(across(c(cause, confidence, age, vibes_c, vibes_a), as.numeric))

d.judgments |>
  write_csv('../data/experiment2_judgments.csv')


