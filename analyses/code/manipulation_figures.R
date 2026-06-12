library(tidyverse)
library(distributional)
library(ggdist)
library(patchwork)

################################################################################
#                                   Experiment 1
################################################################################
d.manipulation <- tibble(name=c('Abnormal','Normal'),
                         mean=75, sd=c(1, 50),
                         actual=floor(4/3*mean + 2/3),
                         sum_mean=150, sum_sd=c(sqrt(1^2 + 50^2), sqrt(2*50^2))) |>
  mutate(name=factor(name, levels=c('Normal', 'Abnormal')))

p.manipulation1 <- ggplot(d.manipulation, aes(fill=name, xdist=dist_normal(mean, sd))) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Normal')) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Abnormal')) +
  geom_vline(aes(xintercept=actual)) +
  geom_text(aes(x=actual), label='Actual Value', y=.95, hjust=-.1, size=3, show.legend=FALSE) +
  xlab('Focal Cause') +
  scale_fill_manual(name='Normality',
                    labels=c('Normal\n(\u03C3=50)',
                             'Abnormal\n(\u03C3=1)'),
                    values=PALETTE) +
  theme_classic(base_size=18) +
  theme(axis.line.y=element_blank(),
        axis.ticks.y=element_blank(),
        axis.text.y=element_blank(),
        axis.title.y=element_blank())
p.manipulation1

p.manipulation2 <- ggplot(d.manipulation, aes(fill=name, xdist=dist_normal(sum_mean, sum_sd))) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Normal')) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Abnormal')) +
  ## annotations for conjunctive condition
  geom_vline(aes(xintercept=actual*2-1), linetype='dashed') +
  geom_text(aes(x=2*actual-1), label='"Conjunctive"', y=.95, hjust=1.1, size=3, show.legend=FALSE) +
  ## annotations for disjunctive condition
  geom_vline(aes(xintercept=actual-1), linetype='dashed') +
  geom_text(aes(x=actual-1), label='"Disjunctive"', y=.95, hjust=1.1, size=3, show.legend=FALSE) +
  geom_vline(aes(xintercept=2*actual)) +
  xlab('Focal Cause + Alternate Cause') +
  scale_fill_manual(name='Normality',
                    labels=c('Normal\n(\u03C3=50)',
                             'Abnormal\n(\u03C3=1)'),
                    values=PALETTE) +
  theme_classic(base_size=18) +
  theme(axis.line.y=element_blank(),
        axis.ticks.y=element_blank(),
        axis.text.y=element_blank(),
        axis.title.y=element_blank())
p.manipulation2

((p.manipulation1 / p.manipulation2) & coord_cartesian(xlim=c(0, 300), expand=FALSE)) +
  plot_layout(guides='collect') +
  plot_annotation(tag_levels='A')
ggsave('../plots/experiment1/manipulation.pdf', width=10, height=5, device=grDevices::cairo_pdf)





################################################################################
#                                   Experiment 2
################################################################################
d.manipulation <- tibble(name=c('Abnormal','Normal'),
                         mean=c(25, 75), sd=c(50, 50),
                         actual=floor(75 + 25/3 + 2/3),
                         sum_mean=c(100, 150), sum_sd=sqrt(2*50^2)) |>
  mutate(name=factor(name, levels=c('Normal', 'Abnormal')))

p.manipulation1 <- ggplot(d.manipulation, aes(fill=name, xdist=dist_normal(mean, sd))) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Normal')) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Abnormal'), alpha=2/3) +
  geom_vline(aes(xintercept=actual)) +
  geom_text(aes(x=actual), label='Actual Value', y=.95, hjust=-.1, size=3, show.legend=FALSE) +
  xlab('Focal Cause') +
  scale_fill_manual(name='Normality',
                    labels=c('Normal\n(\u03BC=25)',
                             'Abnormal\n(\u03BC=75)'),
                    values=PALETTE) +
  theme_classic(base_size=18) +
  theme(axis.line.y=element_blank(),
        axis.ticks.y=element_blank(),
        axis.text.y=element_blank(),
        axis.title.y=element_blank())
p.manipulation1

p.manipulation2 <- ggplot(d.manipulation, aes(fill=name, xdist=dist_normal(sum_mean, sum_sd))) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Normal')) +
  stat_slab(normalize='groups', data= ~ filter(., name=='Abnormal'), alpha=2/3) +
  ## annotations for conjunctive condition
  geom_vline(aes(xintercept=actual*2-1), linetype='dashed') +
  geom_text(aes(x=2*actual-1), label='"Conjunctive"', y=.95, hjust=1.1, size=3, show.legend=FALSE) +
  ## annotations for disjunctive condition
  geom_vline(aes(xintercept=actual-1), linetype='dashed') +
  geom_text(aes(x=actual-1), label='"Disjunctive"', y=.95, hjust=1.1, size=3, show.legend=FALSE) +
  geom_vline(aes(xintercept=2*actual)) +
  xlab('Focal Cause + Alternate Cause') +
  scale_fill_manual(name='Normality',
                    labels=c('Normal\n(\u03BC=25)',
                             'Abnormal\n(\u03BC=75)'),
                    values=PALETTE) +
  theme_classic(base_size=18) +
  theme(axis.line.y=element_blank(),
        axis.ticks.y=element_blank(),
        axis.text.y=element_blank(),
        axis.title.y=element_blank())
p.manipulation2

((p.manipulation1 / p.manipulation2) & coord_cartesian(xlim=c(0, 300), expand=FALSE)) +
  plot_layout(guides='collect') +
  plot_annotation(tag_levels='A')
ggsave('../plots/experiment2/manipulation.pdf', width=10, height=5, device=grDevices::cairo_pdf)
