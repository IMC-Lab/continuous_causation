
## UCL main colors
ucl_white <- "#fafafa"
ucl_dark_purple <- "#361a54"
ucl_bright_purple <- "#993bff"
ucl_mid_purple <- "#ba82ff"
ucl_main_palette <- c(ucl_white, ucl_dark_purple, ucl_bright_purple, ucl_mid_purple)

## supporting colors
ucl_light_purple <- "#ddbdff"
ucl_pale_purple <- "#eedeff"
ucl_heritage_blue <- "#30d6ff"
ucl_supporting_palette <- c(ucl_light_purple, ucl_pale_purple, ucl_heritage_blue)

## other colors
ucl_dark_blue <- "#12239e"
ucl_dark_red <- "#751441"
ucl_dark_green <- "#10433f"
ucl_light_blue <- "#118dff"
ucl_light_orange <- "#e66c37"
ucl_light_pink <- "#e645ab"
ucl_light_green <- "#1aab40"
ucl_other_palette <- c(ucl_light_blue, ucl_light_orange, ucl_light_pink, ucl_light_green,
                       ucl_dark_blue, ucl_dark_red, ucl_dark_green)


## set plot backgrounds to UCL white
ggplot2::set_theme(ggplot2::theme(plot.background=element_rect(fill=ucl_white, color=NA)))

#' A UCL branded ggplot theme
theme_ucl <- function(base_theme=ggplot2::theme_classic,
                      base_size=18, base_family="", header_family = NULL,
                      base_line_size = base_size/22, base_rect_size = base_size/22,
                      ink = ucl_dark_purple, paper = ucl_white, accent = ucl_bright_purple) {
  rlang::check_installed("ggplot2")

  list(
    base_theme(base_size=base_size, base_family=base_family, header_family=header_family,
               base_line_size=base_line_size, base_rect_size=base_rect_size,
               ink=ink, paper=paper, accent=accent),
    theme(plot.background=element_rect(fill="#fafafa", color=NA),
          legend.background=element_blank(),
          strip.text=element_text(color=ink))
  )
}


#' Display a box over a plot for animations
hide_plot <- function(plot, paper=ucl_white) {
  rlang::check_installed(c("ggplot2", "patchwork"))
  
  plot +
    patchwork::inset_element(
      patchwork::plot_spacer() +
        ggplot2::theme(plot.background=ggplot2::element_rect(fill=paper)),
      0, 0, 1, 1, align_to="full"
    )
}

