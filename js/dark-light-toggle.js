/* global KEEP */

KEEP.initModeToggle = () => {
  KEEP.utils.modeToggle = {
    modeToggleButton_dom: document.querySelectorAll('.tool-dark-light-toggle'),
    iconDom: document.querySelectorAll('.tool-dark-light-toggle i'),

    enableLightMode() {
      document.body.classList.remove('dark-mode')
      document.body.classList.add('light-mode')
      document.body.setAttribute('data-theme', 'light')
      this.iconDom.className = 'fas fa-moon'
      KEEP.styleStatus.isDark = false
      KEEP.setStyleStatus()
      
      // 触发 Mermaid 主题更新
      if (typeof KEEP.utils.mermaidThemeChange === 'function') {
        KEEP.utils.mermaidThemeChange()
      }
    },

    enableDarkMode() {
      document.body.classList.add('dark-mode')
      document.body.classList.remove('light-mode')
      document.body.setAttribute('data-theme', 'dark')
      this.iconDom.className = 'fas fa-sun'
      KEEP.styleStatus.isDark = true
      KEEP.setStyleStatus()
      
      // 触发 Mermaid 主题更新
      if (typeof KEEP.utils.mermaidThemeChange === 'function') {
        KEEP.utils.mermaidThemeChange()
      }
    },

    isDarkPrefersColorScheme() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
    },

    initModeStatus() {
      const styleStatus = KEEP.getStyleStatus()

      if (styleStatus) {
        styleStatus.isDark ? this.enableDarkMode() : this.enableLightMode()
      } else {
        this.isDarkPrefersColorScheme().matches ? this.enableDarkMode() : this.enableLightMode()
      }
    },

    initModeToggleButton() {
      // this.modeToggleButton_dom.forEach(item => {
      //   item.addEventListener('click', () => {
      //     const isDark = document.body.classList.contains('dark-mode')
      //     isDark ? this.enableLightMode() : this.enableDarkMode()
      //   })
      // })
      this.modeToggleButton_dom[0].addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode')
        isDark ? this.enableLightMode() : this.enableDarkMode()
      }),
      this.modeToggleButton_dom[1].addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode')
        isDark ? this.enableLightMode() : this.enableDarkMode()
      })
    },

    initModeAutoTrigger() {
      const isDarkMode = this.isDarkPrefersColorScheme()
      isDarkMode.addEventListener('change', (e) => {
        e.matches ? this.enableDarkMode() : this.enableLightMode()
      })
    }
  }

  KEEP.utils.modeToggle.initModeStatus()
  KEEP.utils.modeToggle.initModeToggleButton()
  KEEP.utils.modeToggle.initModeAutoTrigger()
}
