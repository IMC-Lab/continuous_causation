library(tidyverse)
library(shiny)
library(bslib)

setwd("C:/Users/ncvra/OneDrive - Duke University/2020-2026 Duke Philosophy PhD/PhD program/Year 4/Metacognition and Causal Judgement/continuous_causation/Sim")
ui <- page_sidebar(
  # App title ----
  title = "Continuous Causation Parameters",
  # Sidebar panel for inputs ----
  sidebar = sidebar(
    # Input: Slider for the number of bins ----
    sliderInput(inputId="mean", label="Mean", min=0, max=50, value=25, step=5),
    sliderInput(inputId="sd", label="SD", min=0, max=50, value=25, step=5)
  ),
  # Output: Histogram ----
  plotOutput(outputId = "plot")
)

server <- function(input, output) {
  output$plot <- renderPlot({
    print(input$mean)
    print(input$sd)
    ggplot(d, aes(fill=fct_rev(name), xdist=dist_normal(mean, sd))) +
      stat_slab(normalize='groups') +
      geom_vline(aes(xintercept=threshold)) +
      scale_fill_discrete('Variable') +
      theme_classic() +
      theme(axis.line.y=element_blank(),
            axis.ticks.y=element_blank(),
            axis.text.y=element_blank(),
            axis.title.y=element_blank())
  })
}

shinyApp(ui = ui, server = server)

library(ggdist)
library(distributional)
d <- tibble(name=c('C','A'),
       mean=10, 
       sd=c(1, 10),
       c=15, a=15,
       threshold=c+a-1)

ggplot(d, aes(fill=fct_rev(name), xdist=dist_normal(mean, sd))) +
  stat_slab(normalize='groups') +
  geom_vline(aes(xintercept=threshold)) +
  scale_fill_discrete('Variable') +
  theme_classic() +
  theme(axis.line.y=element_blank(),
        axis.ticks.y=element_blank(),
        axis.text.y=element_blank(),
        axis.title.y=element_blank())

ggsave('distributions.pdf', width=6, height=4)


