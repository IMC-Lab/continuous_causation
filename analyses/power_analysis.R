library(tidyverse)
library(multidplyr)
library(ordbetareg)
library(tidybayes)
library(ggdist)
library(bayestestR)

d <- read_csv('data/pilot_judgments.csv') %>% 
    filter(attention_check == 'Yes.') %>%
    mutate(SD_c=factor(sd_c, levels=c(50, 1)),
           threshold=factor(threshold, levels=c(199, 99))) %>%
    group_by(threshold, SD_c)





## Ordered Beta Analyses
prior.ord <- ordbetareg(bf(cause ~ threshold * SD_c,
                           phi ~ threshold * SD_c, center=FALSE),
                        data=d, cores=4, chains=4, iter=10000, phi_reg='both',
                        sample_prior='only',
                        dirichlet_prior=c(2,2,2),
                        intercept_prior_mean=0, intercept_prior_SD=2,
                        coef_prior_mean=0, coef_prior_SD=2,
                        phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                        phi_coef_prior_mean=0, phi_coef_prior_SD=1)
print(prior.ord, prior=TRUE)


m.ord <- ordbetareg(bf(cause ~ threshold * SD_c,
                       phi ~ threshold * SD_c, center=FALSE),
                    data=d, cores=4, chains=4, iter=10000, phi_reg='both',
                    dirichlet_prior=c(2,2,2),
                    intercept_prior_mean=0, intercept_prior_SD=2,
                    coef_prior_mean=0, coef_prior_SD=2,
                    phi_intercept_prior_mean=1, phi_intercept_prior_SD=1,
                    phi_coef_prior_mean=0, phi_coef_prior_SD=1)
print(m.ord, prior=TRUE)

## compute bayes factors
describe_posterior(m.ord, test=c('bf'), bf_prior=prior.ord,
                   parameters=c('b_Intercept', 'b_threshold99',
                                'b_SD_c1', 'b_threshold99:SD_c1'))



## sim_data(m, n_participants=1, n_datasets=1)
##   Use a fitted model to simulate different datasets of a given size
##
##   m: the model to simulate from
##   n_participants: the number of data points per dataset
##   n_datasets: the number of datasets to simulate
##
## Note: each dataset will be simulated from a separate posterior draw to
##       account for estimation uncertainty.
sim_data <- function(m, n_participants=1, n_datasets=1) {
    m$data %>%
        distinct(threshold, SD_c) %>%
        ungroup %>%
        slice_sample(n=n_participants, replace=TRUE) %>%
        add_predicted_draws(m, ndraws=n_datasets) %>%
        rename(cause=.prediction, sim=.draw) %>%
        group_by(sim) %>%
        select(-.row, -.chain, -.iteration) %>%
        nest()
}


## Set up a cluster to run simulations in parallel
cluster <- new_cluster(16)
cluster_library(cluster, c('tidyverse', 'ordbetareg', 'bayestestR', 'tidybayes'))
cluster_copy(cluster, c('m.ord', 'prior.ord', 'sim_data'))


## run model simulations
sims <- expand_grid(N=c(100, 250, 500, 1000),
                    sim=1:10) %>%
    group_by(N) %>%
    mutate(data=sim_data(m.ord, n_participants=N[1], n_datasets=n())$data) %>%
    group_by(N, sim) %>%
    unnest(data)


    partition(cluster) %>%
    mutate(
        ## fit a model to each dataset
        model=map(data, ~ update(m.ord, newdata=.)),
        ## pull out parameters of interest
        b=map_dbl(model, ~ summary(.)$fixed$Estimate[4]),
        b.lower=map_dbl(model, ~ summary(.)$fixed$`l-95% CI`[4]),
        b.upper=map_dbl(model, ~ summary(.)$fixed$`u-95% CI`[4]),
        b.log10_BF=map_dbl(model, ~ bf_pointnull(., parameters='b_SD_c1',
                                                 prior=prior.ord)$log_BF / log(10)),
        interaction=map_dbl(model, ~ summary(.)$fixed$Estimate[5]),
        interaction.lower=map_dbl(model, ~ summary(.)$fixed$`l-95% CI`[5]),
        interaction.upper=map_dbl(model, ~ summary(.)$fixed$`u-95% CI`[5]),
        interaction.log10_BF=map_dbl(model, ~ bf_pointnull(., parameters='b_threshold99:SD_c1',
                                                           prior=prior.ord)$log_BF / log(10))) %>%
    collect() %>%
    arrange(N, sim)

saveRDS(sims, 'power_analysis.rds')
