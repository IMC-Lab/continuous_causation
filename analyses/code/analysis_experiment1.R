library(tidyverse)
library(tidybayes)
library(ggdist)
library(ordbetareg)
library(bayestestR)


PALETTE <- c("#C0C0C0", "#E61C38")

## Read in the judgment data
d <- read_csv('data/experiment1_judgments.csv') %>% 
    filter(attention_check == 'Yes.') %>%
    mutate(SD_c=factor(sd_c, levels=c(50, 1)),
           threshold=factor(threshold, levels=c(199, 99))) %>%
    select(-sd_c) %>%
    group_by(threshold, SD_c)

## Read in the learning stage data
d.learning <- read_csv('data/experiment1_learning.csv') %>%
    filter(id %in% d$id) %>%
    mutate(SD_c=factor(sd_c, levels=c(50, 1)),
           threshold=factor(threshold, levels=c(199, 99)),
           block=factor(block),
           trial=factor(trial)) %>%
    select(-sd_c) %>%
    group_by(id, threshold, SD_c, block)





## Estimate perceived variability by condition (manipulation check)
d.learning.check <- d.learning %>%
    group_by(vignette, .add=TRUE) %>%
    summarize(c=manipulation_check_c[1],
              a=manipulation_check_a[1]) %>%
    pivot_longer(c:a, names_to='variable', values_to='perceived_variability') %>%
    ungroup()


m.learning <- ordbetareg(bf(perceived_variability ~ threshold*SD_c*variable*block + (1|id) +
                                (threshold*SD_c*variable*block || vignette),
                            phi ~ threshold*SD_c*variable*block + (1|id) + (1|vignette),
                            center=FALSE),
                         data=d.learning.check, cores=4, chains=4, warmup=1000, iter=11000,
                         phi_reg='both',
                         dirichlet_prior=c(2,2,2),
                         intercept_prior_mean=0, intercept_prior_SD=2,
                         coef_prior_mean=0, coef_prior_SD=2,
                         phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                         phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                     extra_prior=prior('normal(0, 1)', class='sd') +
                         prior('normal(0, 1)', class='sd', dpar='phi'),
                     backend='cmdstanr', adapt_delta=.95, file='m_learning.rds')
summary(m.learning, prior=TRUE)


d.learning.check %>%
    distinct(threshold, SD_c, variable, block) %>%
    add_epred_draws(m.learning, re_formula=NA) %>%
    median_hdi() %>%
    ggplot(aes(x=block, y=.epred, ymin=.lower, ymax=.upper, group=interaction(SD_c, variable))) +
    facet_grid( ~ threshold, labeller=as_labeller(~ paste0('Threshold: ', .))) +
    geom_ribbon(aes(fill=SD_c), alpha=.1) +
    geom_line(aes(color=SD_c, linetype=variable), linewidth=1) +
    scale_y_continuous('Perceived Variability', limits=0:1,
                       labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
    scale_x_discrete('Block', expand=c(.05, 0)) + 
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    scale_color_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                       values=PALETTE) +
    scale_linetype_manual('Variable', values=c('dotted', 'solid'),
                          labels=c('Alternate\nCause', 'Focal\nCause')) +
    theme_classic(18) +
    theme(panel.grid.major.y=element_line(color='grey80', linewidth=.1))
ggsave('plots/experiment1/manipulation_check.pdf', width=10, height=5)





## Expectation of actual value (normality check)
d.norm <- d %>%
    pivot_longer(vibes_c:vibes_a, names_prefix='vibes_',
                 names_to='variable', values_to='normality')

prior.norm <- ordbetareg(bf(normality ~ threshold * SD_c * variable +
                            (threshold * SD_c * variable || vignette),
                        phi ~ threshold * SD_c * variable + (1 || vignette),
                        center=FALSE), sample_prior='only',
                     data=d.norm, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                     dirichlet_prior=c(2,2,2),
                     intercept_prior_mean=0, intercept_prior_SD=2,
                     coef_prior_mean=0, coef_prior_SD=2,
                     phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                     phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                     extra_prior=prior('normal(0, 1)', class='sd') +
                         prior('normal(0, 1)', class='sd', dpar='phi'),
                     backend='cmdstanr')

m.norm <- ordbetareg(bf(normality ~ threshold * SD_c * variable +
                            (threshold * SD_c * variable || vignette),
                        phi ~ threshold * SD_c * variable + (1 || vignette),
                        center=FALSE),
                     data=d.norm, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                     dirichlet_prior=c(2,2,2),
                     intercept_prior_mean=0, intercept_prior_SD=2,
                     coef_prior_mean=0, coef_prior_SD=2,
                     phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                     phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                     extra_prior=prior('normal(0, 1)', class='sd') +
                         prior('normal(0, 1)', class='sd', dpar='phi'),
                     backend='cmdstanr', file='m_norm.rds')
summary(m.norm, prior=TRUE)


describe_posterior(m.norm, test=c('bf'), bf_prior=prior.norm,
                   parameters=c('b_Intercept', 'b_threshold99',
                                'b_SD_c1', 'b_threshold99:SD_c1'))

## normality contrasts
d.norm %>%
    distinct(threshold, SD_c, variable) %>%
    add_linpred_draws(m.norm, re_formula=NA) %>%
    compare_levels(.linpred, by='SD_c') %>%
    left_join(d.norm %>%
              distinct(threshold, SD_c, variable) %>%
              add_linpred_draws(prior.norm, re_formula=NA) %>%
              compare_levels(.linpred, by='SD_c') %>%
              rename(.linpred.prior=.linpred)) %>%
    mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) %>%
    median_qi(.linpred, BF) %>%
    select(threshold, variable, .linpred, .linpred.lower, .linpred.upper, BF)

## normality contrast by vignette
d.norm %>%
    distinct(threshold, SD_c, variable, vignette) %>%
    add_linpred_draws(m.norm) %>%
    compare_levels(.linpred, by='SD_c') %>%
    left_join(d.norm %>%
              distinct(threshold, SD_c, variable, vignette) %>%
              add_linpred_draws(prior.norm) %>%
              compare_levels(.linpred, by='SD_c') %>%
              rename(.linpred.prior=.linpred)) %>%
    mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) %>%
    median_qi(.linpred, BF) %>%
    select(threshold, variable, .linpred, .linpred.lower, .linpred.upper, BF)


## plot prior/posteriors for normality contrast to visualize BF
d.norm %>%
    distinct(threshold, SD_c, variable) %>%
    add_linpred_draws(m.norm, re_formula=NA) %>%
    compare_levels(.linpred, by='SD_c') %>%
    mutate(model='posterior') %>%
    bind_rows(d.norm %>%
              distinct(threshold, SD_c, variable) %>%
              add_linpred_draws(prior.norm, re_formula=NA) %>%
              compare_levels(.linpred, by='SD_c') %>%
              mutate(model='prior')) %>%
    ggplot(aes(x=.linpred, fill=model)) +
    stat_slab() +
    scale_fill_manual(values=c('skyblue', 'grey90')) +
    geom_vline(xintercept=0, linetype='dashed') +
    facet_grid(variable ~ threshold) +
    coord_cartesian(xlim=c(-5, 5)) +
    theme_classic()

## contrasts of variable (Focal/Alternate) by normality/structure
d.norm %>%
    distinct(threshold, SD_c, variable) %>%
    add_linpred_draws(m.norm, re_formula=NA) %>%
    compare_levels(.linpred, by='variable') %>%
    left_join(d.norm %>%
              distinct(threshold, SD_c, variable) %>%
              add_linpred_draws(prior.norm, re_formula=NA) %>%
              compare_levels(.linpred, by='variable') %>%
              rename(.linpred.prior=.linpred)) %>%
    mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) %>%
    median_qi(.linpred, BF) %>%
    select(threshold, SD_c, .linpred.lower, .linpred.upper, BF)


d.norm %>%
    distinct(threshold, SD_c, variable) %>%
    add_epred_draws(m.norm, re_formula=NA) %>%
    ggplot(aes(x=variable, fill=SD_c)) +
    stat_slab(aes(y=normality, side=SD_c), show.legend=c(side=FALSE),
              position=position_dodge(.25), data=d.norm) +
    stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                       position=position_dodge(.25)) +
    scale_x_discrete(name='', labels=c('Alternate\nCause', 'Focal\nCause')) +
    scale_y_continuous('Surprisal Rating', limits=0:1,
                       labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
    facet_wrap(~ threshold, labeller=as_labeller(~ paste0('Threshold: ', .))) +
    scale_side_mirrored(name='',
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    theme_classic(18) +
    theme(axis.title.x=element_blank())
ggsave('plots/experiment1/normality.pdf', width=10, height=5)


d.norm %>%
    distinct(threshold, SD_c, variable, vignette) %>%
    add_epred_draws(m.norm) %>%
    ggplot(aes(x=variable, fill=SD_c)) +
    stat_slab(aes(y=normality, side=SD_c), show.legend=c(side=FALSE),
              position=position_dodge(.25), data=d.norm) +
    stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                       position=position_dodge(.25)) +
    scale_x_discrete(name='', labels=c('Alternate\nCause', 'Focal\nCause')) +
    scale_y_continuous('Surprisal Rating', limits=0:1,
                       labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
    facet_grid(vignette ~ threshold, labeller=labeller(.cols=~ paste0('Threshold: ', .))) +
    scale_side_mirrored(name='',
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    theme_classic(18) +
    theme(axis.title.x=element_blank())
ggsave('plots/experiment1/normality_vignette.png', width=10, height=15)






## model for causal judgments
m.cause <- ordbetareg(bf(cause ~ threshold * SD_c + (threshold * SD_c || vignette),
                         phi ~ threshold * SD_c + (1 || vignette),
                         center=FALSE),
                      data=d, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                      dirichlet_prior=c(2,2,2),
                      intercept_prior_mean=0, intercept_prior_SD=2,
                      coef_prior_mean=0, coef_prior_SD=2,
                      phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                      phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                      extra_prior=prior('normal(0, 1)', class='sd') +
                          prior('normal(0, 1)', class='sd', dpar='phi'),
                      backend='cmdstanr', file='m_cause.rds')
print(m.cause, prior=TRUE)



prior.cause <- ordbetareg(bf(cause ~ threshold * SD_c + (threshold * SD_c || vignette),
                         phi ~ threshold * SD_c + (1 || vignette),
                         center=FALSE),
                         sample_prior='only',
                         data=d, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                         dirichlet_prior=c(2,2,2),
                         intercept_prior_mean=0, intercept_prior_SD=2,
                         coef_prior_mean=0, coef_prior_SD=2,
                         phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                         phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                         extra_prior=prior('normal(0, 1)', class='sd') +
                             prior('normal(0, 1)', class='sd', dpar='phi'),
                         backend='cmdstanr')



## normality contrasts
d %>%
    distinct(threshold, SD_c) %>%
    add_linpred_draws(m.cause, re_formula=NA) %>%
    compare_levels(.linpred, by=SD_c) %>%
    left_join(d.norm %>%
              distinct(threshold, SD_c) %>%
              add_linpred_draws(prior.cause, re_formula=NA) %>%
              compare_levels(.linpred, by=SD_c) %>%
              rename(.linpred.prior=.linpred)) %>%
    mutate(BF=exp(bf_pointnull(.linpred, .linpred.prior)$log_BF)) %>%
    median_qi(.linpred, BF)


## compute bayes factors
describe_posterior(m.cause, test=c('bf'), bf_prior=prior.cause,
                   parameters=c('b_Intercept', 'b_threshold99',
                                'b_SD_c1', 'b_threshold99:SD_c1'))


d %>%
    distinct(threshold, SD_c) %>%
    add_epred_draws(m.cause, re_formula=NA) %>%
    ggplot(aes(x=threshold, group=SD_c, fill=SD_c)) +
    stat_slab(aes(y=cause, side=SD_c), position=position_dodge(.25), data=d, adjust=.5) +
    stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                       position=position_dodge(.25)) +
    scale_x_discrete(name='Threshold') +
    scale_y_continuous('Causal Judgment', labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
    scale_side_mirrored(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    theme_classic(18)
ggsave('plots/experiment1/cause.pdf', width=10, height=4)

d %>%
    distinct(threshold, SD_c, vignette) %>%
    add_epred_draws(m.cause) %>%
    ggplot(aes(x=threshold, group=SD_c, fill=SD_c)) +
    stat_slab(aes(y=cause, side=SD_c), position=position_dodge(.25), data=d) +
    stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                       position=position_dodge(.25)) +
    scale_x_discrete(name='Threshold') +
    scale_y_continuous('Causal Judgment') +
    coord_cartesian(ylim=c(0, 1)) +
    facet_wrap(~ vignette) +
    scale_side_mirrored(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    theme_classic()
ggsave('plots/experiment1/cause_vignette.png', width=10, height=5)

## Plot prior/posteriors of model coefficients to visualize BFs
m.cause %>%
    gather_draws(`b_Intercept`, `b_threshold99`,
                 `b_SD_c1`, `b_threshold99:SD_c1`) %>%
    ggplot(aes(x=.value, y=.variable)) +
    stat_slab(alpha=.25, normalize='none', scale=.25,
              data=prior.cause %>%
                  gather_draws(`b_Intercept`, `b_threshold99`,
                               `b_SD_c1`, `b_threshold99:SD_c1`)) +
    stat_halfeye(normalize='none', scale=.25, fill='skyblue') +
    geom_vline(xintercept=0, linetype='dashed') +
    coord_cartesian(xlim=c(-5, 5)) +
    theme_classic(18)

## Check for differences in precision/inverse variance parameter
d %>%
    distinct(threshold, SD_c) %>%
    add_epred_draws(m.cause, dpar='phi', re_formula=NA) %>%
    ggplot(aes(x=threshold, y=phi, group=SD_c, fill=SD_c, side=SD_c)) +
    stat_halfeye(position=position_dodge(.25)) +
    geom_hline(yintercept=0, linetype='dashed') +
    scale_x_discrete(name='Threshold') +
    scale_y_continuous('Precision Parameter') +
    coord_cartesian(ylim=c(0, 10)) +
    scale_side_mirrored(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    theme_classic()






## model for confidence ratings
m.confidence <- ordbetareg(bf(confidence ~ threshold * SD_c + (threshold * SD_c || vignette),
                              phi ~ threshold * SD_c + (1 || vignette),
                              center=FALSE),
                           data=d, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                           dirichlet_prior=c(2,2,2),
                           intercept_prior_mean=0, intercept_prior_SD=2,
                           coef_prior_mean=0, coef_prior_SD=2,
                           phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                           phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                           extra_prior=prior('normal(0, 1)', class='sd'),
                           backend='cmdstanr', file='m_confidence.rds')
print(m.confidence, prior=TRUE)

prior.confidence <- ordbetareg(bf(confidence ~ threshold * SD_c + (threshold * SD_c || vignette),
                                  phi ~ threshold * SD_c + (1 |v| vignette),
                                  center=FALSE), sample_prior='only',
                               data=d, cores=4, chains=4, warmup=1000, iter=11000, phi_reg='both',
                               dirichlet_prior=c(2,2,2),
                               intercept_prior_mean=0, intercept_prior_SD=2,
                               coef_prior_mean=0, coef_prior_SD=2,
                               phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                    phi_coef_prior_mean=0, phi_coef_prior_SD=1,
                    extra_prior=prior('normal(0, 1)', class='sd'))


d.norm %>%
    distinct(threshold, SD_c) %>%
    add_epred_draws(m.confidence, re_formula=NA) %>%
    ggplot(aes(x=threshold, group=SD_c, fill=SD_c)) +
    stat_slab(aes(y=confidence, side=SD_c), position=position_dodge(.25), data=d, adjust=.5) +
    stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                       position=position_dodge(.25)) +
    scale_x_discrete(name='Threshold') +
    scale_y_continuous('Confidence', labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
    scale_side_mirrored(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    theme_classic(18)
ggsave('plots/experiment1/confidence.pdf', width=10, height=5)


d.norm %>%
    distinct(threshold, SD_c, vignette) %>%
    add_epred_draws(m.confidence) %>%
    ggplot(aes(x=threshold, group=SD_c, fill=SD_c)) +
    stat_slab(aes(y=confidence, side=SD_c), position=position_dodge(.25), data=d, adjust=.5) +
    stat_pointinterval(aes(y=.epred), point_interval=median_hdi, .width=.95,
                       position=position_dodge(.25)) +
    scale_x_discrete(name='Threshold') +
    scale_y_continuous('Confidence', labels=c('0', '.25', '.5', '.75', '1'), expand=c(0, 0)) +
    scale_side_mirrored(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                        start='bottomleft') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
                      values=PALETTE) +
    facet_wrap(~ vignette) +
    theme_classic(18)

