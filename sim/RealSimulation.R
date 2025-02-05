library(tidyverse)
library(shiny)
library(bslib)
library(ggdist)
library(distributional)



ui <- fluidPage(titlePanel('Continuous Causation Parameters'),
                sidebarLayout(sidebarPanel(
                  sliderInput(inputId="mean", label="Mean", min=0, max=150, value=10, step=5),
                  sliderInput(inputId="sd_abnormal", label="SD (Abnormal)", min=0, max=20, value=.1, step=.01),
                  sliderInput(inputId="sd_normal", label="Normal", min=0, max=50, value=5, step=1),
                  sliderInput(inputId="actual", label="Actual value", min=0, max=200, value=15, step=1)),
                  mainPanel(plotOutput(outputId='cause_plot'),
                            plotOutput(outputId='effect_plot'))))

server <- function(input, output) {
  output$cause_plot <- renderPlot({
    d <- tibble(name=c('Abnormal','Normal'),
                mean=input$mean,
                sd=c(input$sd_abnormal, input$sd_normal),
                actual=input$actual)
    
    ggplot(d, aes(fill=name, xdist=dist_normal(mean, sd))) +
      stat_slab(normalize='groups') +
      geom_vline(aes(xintercept=actual)) +
      scale_fill_discrete('Variable') +
      theme_classic(base_size=24) +
      theme(axis.line.y=element_blank(),
            axis.ticks.y=element_blank(),
            axis.text.y=element_blank(),
            axis.title=element_blank())
  })
  
  output$effect_plot <- renderPlot({
    d <- tibble(name=c('Abnormal','Normal'),
                mean=input$mean * 2,
                sd=c(sqrt(input$sd_abnormal^2 + input$sd_normal^2),
                     sqrt(2*input$sd_normal^2)))
    
    ggplot(d, aes(fill=name, xdist=dist_normal(mean, sd))) +
      stat_slab(normalize='groups', show.legend=FALSE) +
      geom_vline(xintercept=c(input$actual*2-1, input$actual-1),
                 linetype='dashed') +
      geom_text(aes(label=sprintf('%.2f percent', pnorm(input$actual*2-1, mean=mean, sd=sd, lower.tail=FALSE)*100)), 
                x=input$actual*2-1, y=.5, hjust=-0.5) +
      geom_text(aes(label=sprintf('%.2f percent', pnorm(input$actual-1, mean=mean, sd=sd)*100)), 
                x=input$actual-1, y=.5, hjust=1.5) +
      xlab('C + A') +
      scale_fill_discrete('Variable') +
      theme_classic(base_size=24) +
      theme(axis.line.y=element_blank(),
            axis.ticks.y=element_blank(),
            axis.text.y=element_blank(),
            axis.title.y=element_blank())
  })
}

shinyApp(ui = ui, server = server)

#Use the following code to upload to shinyapps.io:
library(rsconnect)

#deploy Shiny app
#deployApp(appPrimaryDoc="RealSimulation.R")

