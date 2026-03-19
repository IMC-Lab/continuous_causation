library(tidyverse)
library(tidybayes)
library(ggdist)
library(ordbetareg)
library(bayestestR)

model_dir <- '../models/experiment2/'
plot_dir <- '../plots/experiment2/'
PALETTE <- c("#C0C0C0", "#E61C38")

## Read in the judgment data
d <- read_csv('../data/experiment2_judgments.csv') |> 
  filter(attention_check == 'Yes.') |>
  mutate(normality=factor(mu_c, levels=c(75, 25), labels=c('Normal', 'Abnormal')),
         structure=factor(threshold, levels=c(167,83), labels=c('Conjunctive', 'Disjunctive'))) |>
  select(-mu_c) |>
  group_by(structure, normality)
names(d)


## Read in the learning stage data
d.learning <- read_csv('../data/experiment2_learning.csv') |>
  filter(id %in% d$id) |>
  mutate(normality=factor(mu_c, levels=c(75, 25), labels=c('Normal', 'Abnormal')),
         structure=factor(threshold, levels=c(167, 83), labels=c('Conjunctive', 'Disjunctive')),
         block=factor(block),
         trial=factor(trial)) |>
  select(-mu_c) |>
  group_by(id, structure, normality, block)
names(d.learning)


## Estimate perceived average by condition (manipulation check)
d.learning.check <- d.learning |>
  group_by(vignette, .add=TRUE) |>
  summarize(c=manipulation_check_c[1],
            a=manipulation_check_a[1]) |>
  pivot_longer(c:a, names_to='variable', values_to='perceived_average') |>
  ungroup() |>
  mutate(variable=factor(variable, levels=c('c','a')))


m.learning <- ordbetareg(bf(perceived_average ~ structure*normality*variable*block + (1|id) +
                              (structure*normality*variable*block || vignette),
                            phi ~ structure*normality*variable*block + (1|id) + (1|vignette),
                            center=FALSE),
                         data=d.learning.check, cores=4, chains=4, warmup=1000, iter=11000,
                         phi_reg='both', dirichlet_prior=c(2,2,2),
                         intercept_prior_mean=0, intercept_prior_SD=2,
                         coef_prior_mean=0, coef_prior_SD=2,
                         phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                         phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                         extra_prior=prior('normal(0, 1)', class='sd') +
                           prior('normal(0, 1)', class='sd', dpar='phi'),
                         backend='cmdstanr', adapt_delta=.95,
                         file=paste0(model_dir, 'learning.rds'))
prior.learning <- update(m.learning, sample_prior='only', cores=4)
summary(m.learning, prior=TRUE)


d.learning.check |>
  distinct(structure, normality, variable, block) |>
  add_epred_draws(m.learning, re_formula=NA) |>
  median_hdi() |>
  mutate(variable=factor(variable, levels=c('a', 'c'))) |>
  ggplot(aes(x=block, y=.epred, ymin=.lower, ymax=.upper,
             group=interaction(normality, variable))) +
  facet_grid( ~ structure, labeller=as_labeller(~ paste0('Structure: ', .))) +
  geom_ribbon(aes(fill=normality), alpha=.1) +
  geom_line(aes(color=normality, linetype=variable), linewidth=1) +
  scale_y_continuous('Perceived Average', limits=0:1,
                     labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  scale_x_discrete('Block', expand=c(.05, 0)) + 
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  scale_color_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                     values=PALETTE) +
  scale_linetype_manual('Variable', values=c('dotted', 'solid'),
                        labels=c('Focal\nCause', 'Alternate\nCause')) +
  theme_classic(18) +
  theme(panel.grid.major.y=element_line(color='grey80', linewidth=.1))
ggsave(paste0(plot_dir, 'manipulation_check.pdf'), width=10, height=5)


d.learning.check |>
  distinct(vignette, structure, normality, variable, block) |>
  add_epred_draws(m.learning, re_formula=NA) |>
  median_hdi() |>
  mutate(variable=factor(variable, levels=c('a', 'c'))) |>
  ggplot(aes(x=block, y=.epred, ymin=.lower, ymax=.upper,
             group=interaction(normality, variable))) +
  facet_grid(vignette ~ structure, labeller=labeller(.cols=as_labeller(~ paste0('Structure: ', .)))) +
  geom_ribbon(aes(fill=normality), alpha=.1) +
  geom_line(aes(color=normality, linetype=variable), linewidth=1) +
  scale_y_continuous('Perceived Average', limits=0:1,
                     labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  scale_x_discrete('Block', expand=c(.05, 0)) + 
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  scale_color_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                     values=PALETTE) +
  scale_linetype_manual('Variable', values=c('dotted', 'solid'),
                        labels=c('Focal\nCause', 'Alternate\nCause')) +
  theme_classic(18) +
  theme(panel.grid.major.y=element_line(color='grey80', linewidth=.1))
ggsave(paste0(plot_dir, 'manipulation_check_vignette.pdf'), width=10, height=15)





## Expectation of actual value (normality check)
d.norm <- d |>
  pivot_longer(vibes_c:vibes_a, names_prefix='vibes_',
               names_to='variable', values_to='perceived_normality')

m.norm <- ordbetareg(bf(perceived_normality ~ normality * structure * variable +
                          (structure * normality * variable || vignette),
                        phi ~  structure* normality * variable + (1 || vignette),
                        center=FALSE),
                     data=d.norm, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                     dirichlet_prior=c(2,2,2),
                     intercept_prior_mean=0, intercept_prior_SD=2,
                     coef_prior_mean=0, coef_prior_SD=2,
                     phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                     phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                     extra_prior=prior('normal(0, 1)', class='sd') +
                       prior('normal(0, 1)', class='sd', dpar='phi'),
                     backend='cmdstanr',
                     file=paste0(model_dir, 'normality.rds'))
prior.norm <- update(m.norm, sample_prior='only', cores=4)
summary(m.norm, prior=TRUE)


## normality contrasts
d.norm |>
  distinct(structure, normality, variable) |>
  add_linpred_draws(m.norm, re_formula=NA) |>
  compare_levels(.linpred, by='normality') |>
  left_join(d.norm |>
              distinct(structure, normality, variable) |>
              add_linpred_draws(prior.norm, re_formula=NA) |>
              compare_levels(.linpred, by='normality') |>
              rename(.linpred.prior=.linpred)) |>
  mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) |>
  median_qi(.linpred, BF) |>
  select(structure, variable, .linpred, .linpred.lower, .linpred.upper, BF)

## normality contrast by vignette
d.norm |>
  distinct(structure, normality, variable, vignette) |>
  add_linpred_draws(m.norm) |>
  compare_levels(.linpred, by='normality') |>
  left_join(d.norm |>
              distinct(structure, normality, variable, vignette) |>
              add_linpred_draws(prior.norm) |>
              compare_levels(.linpred, by='normality') |>
              rename(.linpred.prior=.linpred)) |>
  mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) |>
  median_qi(.linpred, BF) |>
  select(structure, variable, vignette, .linpred, .linpred.lower, .linpred.upper, BF) |>
  print(n=Inf)


## plot prior/posteriors for normality contrast to visualize BF
d.norm |>
  distinct(structure, normality, variable) |>
  add_linpred_draws(m.norm, re_formula=NA) |>
  compare_levels(.linpred, by='normality') |>
  mutate(model='posterior') |>
  bind_rows(d.norm |>
              distinct(structure, normality, variable) |>
              add_linpred_draws(prior.norm, re_formula=NA) |>
              compare_levels(.linpred, by='normality') |>
              mutate(model='prior')) |>
  ggplot(aes(x=.linpred, fill=model)) +
  stat_slab() +
  scale_fill_manual(values=c('skyblue', 'grey90')) +
  geom_vline(xintercept=0, linetype='dashed') +
  facet_grid(variable ~ structure) +
  coord_cartesian(xlim=c(-5, 5)) +
  theme_classic()

## contrasts of variable (Focal/Alternate) by normality/structure
d.norm |>
  distinct(structure, normality, variable) |>
  add_linpred_draws(m.norm, re_formula=NA) |>
  compare_levels(.linpred, by='variable') |>
  left_join(d.norm |>
              distinct(structure, normality, variable) |>
              add_linpred_draws(prior.norm, re_formula=NA) |>
              compare_levels(.linpred, by='variable') |>
              rename(.linpred.prior=.linpred)) |>
  mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) |>
  median_qi(.linpred, BF) |>
  select(structure, normality, .linpred.lower, .linpred.upper, BF)


d.norm |>
  distinct(normality, variable) |>
  add_epred_draws(m.norm, re_formula=NA) |>
  ggplot(aes(x=variable, fill=normality)) +
  stat_slab(aes(y=perceived_normality, side=normality), show.legend=c(side=FALSE),
            position=position_dodge(.25), data=d.norm) +
  stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                     position=position_dodge(.25)) +
  scale_x_discrete(name='', labels=c('Alternate\nCause', 'Focal\nCause')) +
  scale_y_continuous('Surprisal Rating', limits=0:1,
                     labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  facet_wrap(~ structure, labeller=as_labeller(~ paste0('Structure: ', .))) +
  scale_side_mirrored(name='',
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  theme_classic(18) +
  theme(axis.title.x=element_blank())
ggsave(paste0(plot_dir, 'normality.pdf'), width=10, height=5)


d.norm |>
  distinct(structure, normality, variable, vignette) |>
  add_epred_draws(m.norm) |>
  ggplot(aes(x=variable, fill=normality)) +
  stat_slab(aes(y=perceived_normality, side=normality), show.legend=c(side=FALSE),
            position=position_dodge(.25), data=d.norm) +
  stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                     position=position_dodge(.25)) +
  scale_x_discrete(name='', labels=c('Alternate\nCause', 'Focal\nCause')) +
  scale_y_continuous('Surprisal Rating', limits=0:1,
                     labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  facet_grid(vignette ~ structure, labeller=labeller(.cols=~ paste0('Structure: ', .))) +
  scale_side_mirrored(name='',
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  theme_classic(18) +
  theme(axis.title.x=element_blank())
ggsave(paste0(plot_dir, 'normality_vignette.pdf'), width=10, height=15)




## model for causal judgments
m.cause <- ordbetareg(bf(cause ~ structure*normality + (structure * normality || vignette),
                         phi ~ structure * normality + (1 || vignette),
                         center=FALSE),
                      data=d, cores=4, chains=4, warmup=1000, iter=11000,
                      phi_reg='both',
                      dirichlet_prior=c(2,2,2),
                      intercept_prior_mean=0, intercept_prior_SD=2,
                      coef_prior_mean=0, coef_prior_SD=2,
                      phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                      phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                      backend='cmdstanr',
                      file=paste0(model_dir, 'cause.rds'))
prior.cause <- update(m.cause, sample_prior='only', cores=4)
print(m.cause, prior=TRUE)


## normality contrasts
d |>
  distinct(structure, normality) |>
  add_linpred_draws(m.cause, re_formula=NA) |>
  compare_levels(.linpred, by=normality) |>
  left_join(d.norm |>
              distinct(structure, normality) |>
              add_linpred_draws(prior.cause, re_formula=NA) |>
              compare_levels(.linpred, by=normality) |>
              rename(.linpred.prior=.linpred)) |>
  mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) |>
  median_qi(.linpred, BF)


d |>
  distinct(normality) |>
  add_epred_draws(m.cause, re_formula=NA) |>
  ggplot(aes(x=structure, group=normality, fill=normality)) +
  stat_slab(aes(y=cause, side=normality), position=position_dodge(.25), data=d, adjust=.5) +
  stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                     position=position_dodge(.25)) +
  scale_x_discrete(name='Structure') +
  scale_y_continuous('Causal Judgment', labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  scale_side_mirrored(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  theme_classic(18)
ggsave(paste0(plot_dir, 'cause.pdf'), width=6, height=4)

d |>
  distinct(structure, normality, vignette) |>
  add_epred_draws(m.cause) |>
  ggplot(aes(x=structure, group=normality, fill=normality)) +
  stat_slab(aes(y=cause, side=normality), position=position_dodge(.25), data=d) +
  stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                     position=position_dodge(.25)) +
  scale_x_discrete(name='Structure') +
  scale_y_continuous('Causal Judgment') +
  coord_cartesian(ylim=c(0, 1)) +
  facet_wrap(~ vignette) +
  scale_side_mirrored(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  theme_classic()
ggsave(paste0(plot_dir, 'cause_vignette.pdf'), width=10, height=5)

## Plot prior/posteriors of model coefficients to visualize BFs
m.cause |>
  gather_draws(`b_Intercept`, `b_structureDisjunctive`,
               `b_normalityAbnormal`, `b_structureDisjunctive:normalityAbnormal`) |>
  ggplot(aes(x=.value, y=.variable)) +
  stat_slab(alpha=.25, normalize='none', scale=.25,
            data=prior.cause |>
              gather_draws(`b_Intercept`, `b_structureDisjunctive`,
                           `b_normalityAbnormal`, `b_structureDisjunctive:normalityAbnormal`)) +
  stat_halfeye(normalize='none', scale=.25, fill='skyblue') +
  geom_vline(xintercept=0, linetype='dashed') +
  coord_cartesian(xlim=c(-5, 5)) +
  theme_classic(18)

## Check for differences in precision/inverse variance parameter
d |>
  distinct(structure, normality) |>
  add_epred_draws(m.cause, dpar='phi', re_formula=NA) |>
  ggplot(aes(x=structure, y=phi, group=normality, fill=normality, side=normality)) +
  stat_halfeye(position=position_dodge(.25)) +
  geom_hline(yintercept=0, linetype='dashed') +
  scale_x_discrete(name='Structure') +
  scale_y_continuous('Precision Parameter') +
  coord_cartesian(ylim=c(0, 10)) +
  scale_side_mirrored(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  theme_classic()
ggsave(paste0(plot_dir, 'cause_precision.pdf'), width=6, height=4)






## model for confidence ratings
m.confidence <- ordbetareg(bf(confidence ~ structure * normality + (structure * normality || vignette),
                              phi ~ structure * normality + (1 || vignette),
                              center=FALSE),
                           data=d, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                           dirichlet_prior=c(2,2,2),
                           intercept_prior_mean=0, intercept_prior_SD=2,
                           coef_prior_mean=0, coef_prior_SD=2,
                           phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                           phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                           extra_prior=prior('normal(0, 1)', class='sd'),
                           backend='cmdstanr',
                           file=paste0(model_dir, 'confidence.rds'))
prior.confidence <- update(m.confidence, sample_prior='only', cores=4)
print(m.confidence, prior=TRUE)


d.norm |>
  distinct(structure, normality) |>
  add_epred_draws(m.confidence, re_formula=NA) |>
  ggplot(aes(x=structure, group=normality, fill=normality)) +
  stat_slab(aes(y=confidence, side=normality), position=position_dodge(.25), data=d, adjust=.5) +
  stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                     position=position_dodge(.25)) +
  scale_x_discrete(name='Structure') +
  scale_y_continuous('Confidence', labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  scale_side_mirrored(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  theme_classic(18)
ggsave(paste0(plot_dir, 'confidence.pdf'), width=6, height=4)


d.norm |>
  distinct(structure, normality, vignette) |>
  add_epred_draws(m.confidence) |>
  ggplot(aes(x=structure, group=normality, fill=normality)) +
  stat_slab(aes(y=confidence, side=normality), position=position_dodge(.25), data=d, adjust=.5) +
  stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                     position=position_dodge(.25)) +
  scale_x_discrete(name='Structure') +
  scale_y_continuous('Confidence', labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
  scale_side_mirrored(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                      start='bottomleft') +
  scale_fill_manual(name='Normality', labels=c('Normal\n(mu=75)', 'Abnormal\n(mu=25)'),
                    values=PALETTE) +
  facet_wrap(~ vignette) +
  theme_classic(18)
ggsave(paste0(plot_dir, 'confidence_vignette.pdf'), width=10, height=5)
