library(tidyverse)
library(shiny)
library(ggdist)
library(distributional)

## Define a user interface with sliders and two plot outputs
ui <- fluidPage(titlePanel('Continuous Causation Parameters'),
                sidebarLayout(sidebarPanel(
                    sliderInput(inputId="mean_normal", label="Mean (Normal)", min=0, max=100, value=75, step=1),
                    sliderInput(inputId="mean_abnormal", label="Mean (Abnormal)", min=0, max=100, value=50, step=1),
                    sliderInput(inputId="sd", label="SD", min=0, max=50, value=25, step=1),
                    sliderInput(inputId="trial_count", label="Number of Learning Trials",
                                min=1, max=100, value=40, step=1)),
                    mainPanel(plotOutput(outputId='cause_plot'),
                              plotOutput(outputId='effect_plot'),
                              plotOutput(outputId='trial_plot'))))

## mu_CA_normal = mu_normal + mu_normal
## mu_CA_abnormal = mu_normal + mu_abnormal

## midpoint = (3*mu_normal + mu_abnormal)/2

## theta_con = 2*a - 1
## theta_dis = a - 1

## midpoint - theta_dis = theta_con - midpoint
## 2*midpoint = theta_con + theta_dis
## 3*mu_normal + mu_abnormal = 3a - 2
## 3*mu_normal + mu_abnormal + 2 = 3a
## mu_normal + 1/3*mu_abnormal + 2/3 = a

## mean_normal + 1/3*mean_abnormal + 1/3 = mean_normal
## 1/3*mean_abnormal + 1/3 = 0
## mean_abnormal = -1
## 


server <- function(input, output) {
    
    
    ## Make one plot to show how normal/abnormal the actual values are
    output$cause_plot <- renderPlot({
        d <- tibble(name=c('Abnormal','Normal'),
                    mean=c(input$mean_abnormal, input$mean_normal),
                    sd=c(input$sd, input$sd),
                    actual=round(input$mean_normal + 1/3*input$mean_abnormal + 2/3))
        
        ggplot(d, aes(fill=name, xdist=dist_normal(mean, sd))) +
            stat_slab(normalize='groups', alpha=.75) +
            geom_vline(aes(xintercept=actual), linetype='dashed') +
            geom_vline(xintercept=0) +
            geom_label(aes(label=sprintf('%.2f %%', pnorm(0, mean=mean, sd=sd)*100),
                           color=name, y=as.integer(factor(name))/3),
                       x=0, hjust=1.1, size=8, fill='white', show.legend=FALSE) +
            xlab('C') +
            scale_fill_discrete('Variable') +
            theme_classic(base_size=24) +
            theme(axis.line.y=element_blank(),
                  axis.ticks.y=element_blank(),
                  axis.text.y=element_blank(),
                  axis.title.y=element_blank())
    })

    ## Make one plot to show how likely the effect is
    output$effect_plot <- renderPlot({
        d <- tibble(name=c('Abnormal','Normal'),
                    mean=c(input$mean_abnormal+input$mean_normal, input$mean_normal*2),
                    sd=c(sqrt(2)*input$sd, sqrt(2)*input$sd),
                    actual=round(input$mean_normal + 1/3*input$mean_abnormal + 2/3),
                    label_y=c(.5, .75))
        
        ggplot(d, aes(fill=name, xdist=dist_normal(mean, sd))) +
            stat_slab(normalize='groups', alpha=.75) +
            ## annotations for conjunctive condition
            geom_vline(aes(xintercept=actual*2-1), linetype='dashed') +
            geom_label(aes(label=sprintf('%.2f %%', pnorm(actual*2-1, mean=mean, sd=sd, lower.tail=FALSE)*100),
                           x=actual*2-1, y=label_y, color=name), 
                       hjust=-0.5, size=12, fill='white', show.legend=FALSE) +
            ## annotations for disjunctive condition
            geom_vline(aes(xintercept=actual-1), linetype='dashed') +
            geom_label(aes(label=sprintf('%.2f %%', pnorm(actual-1, mean=mean, sd=sd)*100),
                           x=actual-1, y=label_y, color=name), 
                       hjust=1.5, size=12, fill='white', show.legend=FALSE) +
            xlab('C + A') +
            scale_fill_discrete('Variable') +
            theme_classic(base_size=24) +
            theme(axis.line.y=element_blank(),
                  axis.ticks.y=element_blank(),
                  axis.text.y=element_blank(),
                  axis.title.y=element_blank())
    })

    output$trial_plot <- renderPlot({
        d <- tibble(name=c('Abnormal','Normal'),
                    mean=c(input$mean_abnormal+input$mean_normal, input$mean_normal*2),
                    sd=c(sqrt(2)*input$sd, sqrt(2)*input$sd),
                    actual=round(input$mean_normal + 1/3*input$mean_abnormal + 2/3),
                    prob=pnorm(actual-1, mean=mean, sd=sd),
                    N=input$trial_count)

        ggplot(d, aes(fill=name, xdist=dist_binomial(N, prob))) +
            stat_slab(normalize='groups', alpha=.75) +
            xlab('Trial Count') +
            scale_fill_discrete('Variable') +
            theme_classic(base_size=24) +
            theme(axis.line.y=element_blank(),
                  axis.ticks.y=element_blank(),
                  axis.text.y=element_blank(),
                  axis.title.y=element_blank())
    })
}

shinyApp(ui = ui, server = server)

##  Use the following code to upload to shinyapps.io:
##
## library(rsconnect)
## deployApp(appName='continuous_causation')


library(patchwork)

d.manipulation <- tibble(name=c('Abnormal','Normal'),
                         mean=75, sd=c(1, 50),
                         actual=floor(4/3*mean + 2/3),
                         sum_mean=150, sum_sd=c(sqrt(1^2 + 50^2), sqrt(2*50^2))) %>%
    mutate(name=factor(name, levels=c('Normal', 'Abnormal')))

p.manipulation1 <- ggplot(d.manipulation, aes(fill=name, xdist=dist_normal(mean, sd))) +
    stat_slab(normalize='groups', data= ~ filter(., name=='Normal')) +
    stat_slab(normalize='groups', data= ~ filter(., name=='Abnormal')) +
    geom_vline(aes(xintercept=actual)) +
    geom_text(aes(x=actual), label='Actual Value', y=.95, hjust=-.1, size=3, show.legend=FALSE) +
    xlab('Focal Cause') +
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
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
    scale_fill_manual(name='Normality', labels=c('Normal\n(SD=50)', 'Abnormal\n(SD=1)'),
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

ggsave('plots/experiment1/manipulation.pdf', width=10, height=5)

