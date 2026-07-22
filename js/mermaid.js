/**
 * Mermaid diagrams support
 */

KEEP.utils.mermaidInit = () => {
  const mermaidElements = document.querySelectorAll('.mermaid')
  
  if (mermaidElements.length === 0) {
    return
  }

  // 获取主题配置
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark'
  const mermaidConfig = KEEP.theme_config.mermaid || {}
  
  // 设置主题和自定义变量
  let theme = 'base'
  let themeVariables = {}
  
  if (isDarkMode) {
    // 为暗色模式自定义颜色变量
    themeVariables = {
      // 基础颜色
      darkMode: true,
      background: '#121212',
      primaryColor: '#bb86fc',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#bb86fc',
      lineColor: '#bb86fc',
      
      // 文字颜色
      textColor: '#ffffff',
      secondaryTextColor: '#ffffff',
      tertiaryTextColor: '#ffffff',
      
      // 节点样式
      nodeBkg: '#2d2833',
      nodeBorder: '#bb86fc',
      nodeTextColor: '#ffffff',
      
      // 边和连线
      edgeLabelBackground: '#1e1e1e',
      edgeColor: '#bb86fc',
      arrowheadColor: '#bb86fc',
      
      // 集群/子图
      clusterBkg: '#1f1b24',
      clusterBorder: '#6200ea',
      
      // 序列图
      actorBkg: '#2d2833',
      actorBorder: '#bb86fc',
      actorTextColor: '#ffffff',
      actorLineColor: '#bb86fc',
      signalColor: '#bb86fc',
      signalTextColor: '#ffffff',
      labelBoxBkgColor: '#1e1e1e',
      labelBoxBorderColor: '#bb86fc',
      labelTextColor: '#ffffff',
      loopTextColor: '#ffffff',
      noteTextColor: '#ffffff',
      noteBorderColor: '#6200ea',
      noteBkgColor: '#1f1b24',
      activationBorderColor: '#bb86fc',
      activationBkgColor: '#2d2833',
      sequenceNumberColor: '#ffffff',
      
      // 状态图
      stateBkg: '#2d2833',
      stateBorder: '#bb86fc',
      stateTextColor: '#ffffff',
      
      // 甘特图
      gridColor: '#404040',
      section0: '#2d2833',
      section1: '#3d3846',
      section2: '#4d4d5c',
      section3: '#5d5d6c',
      
      // 饼图
      pieTitleTextSize: '25px',
      pieTitleTextColor: '#ffffff',
      pieSectionTextColor: '#ffffff',
      pieSectionTextSize: '17px',
      pieStrokeColor: '#121212',
      pieStrokeWidth: '2px',
      pie1: '#bb86fc',
      pie2: '#03dac6',
      pie3: '#cf6679',
      pie4: '#6200ea',
      pie5: '#8e24aa',
      pie6: '#5e35b1',
      pie7: '#3949ab',
      pie8: '#1e88e5',
      pie9: '#039be5',
      pie10: '#00acc1',
      pie11: '#00897b',
      pie12: '#43a047'
    }
  } else {
    // 为亮色模式自定义颜色变量
    themeVariables = {
      darkMode: false,
      background: '#ffffff',
      primaryColor: '#6366f1',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#4f46e5',
      lineColor: '#6366f1',
      textColor: '#1f2937',
      nodeBkg: '#f8fafc',
      nodeBorder: '#6366f1',
      clusterBkg: '#f1f5f9',
      clusterBorder: '#4f46e5'
    }
  }

  // 初始化 Mermaid
  mermaid.initialize({
    theme: theme,
    themeVariables: themeVariables,
    startOnLoad: false,
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'cardinal',
      padding: 15
    },
    sequence: {
      useMaxWidth: true,
      showSequenceNumbers: true,
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35
    },
    gantt: {
      useMaxWidth: true,
      numberSectionStyles: 4,
      axisFormat: '%m/%d/%Y',
      tickInterval: '1day'
    },
    journey: {
      useMaxWidth: true,
      diagramMarginX: 50,
      diagramMarginY: 10
    },
    gitGraph: {
      useMaxWidth: true,
      mainBranchName: 'main'
    },
    pie: {
      useMaxWidth: true,
      textPosition: 0.75
    },
    state: {
      useMaxWidth: true
    },
    class: {
      useMaxWidth: true
    }
  })

  // 渲染所有 Mermaid 图表
  mermaidElements.forEach(async (element, index) => {
    const graphDefinition = element.textContent || element.innerText
    const graphId = 'mermaid-' + index + '-' + Date.now()
    
    // 保存原始代码以便主题切换时使用
    if (!element.getAttribute('data-original-code')) {
      element.setAttribute('data-original-code', graphDefinition)
    }
    
    try {
      // 使用新版本的 mermaid.render API
      const { svg } = await mermaid.render(graphId, graphDefinition)
      element.innerHTML = svg
      element.classList.add('mermaid-rendered')
      
      // 确保添加主题样式类
      element.classList.remove('mermaid-dark', 'mermaid-light')
      element.classList.add(isDarkMode ? 'mermaid-dark' : 'mermaid-light')
      
      console.log(`Mermaid rendered with theme: ${isDarkMode ? 'dark' : 'light'}`)
    } catch (error) {
      console.error('Mermaid rendering error:', error)
      element.innerHTML = '<div class="mermaid-error">图表渲染失败: ' + error.message + '</div>'
    }
  })
}

// 主题切换时重新渲染
KEEP.utils.mermaidThemeChange = () => {
  const mermaidElements = document.querySelectorAll('.mermaid-rendered')
  
  if (mermaidElements.length === 0) {
    return
  }

  console.log('Mermaid theme change triggered')

  // 重置所有已渲染的图表
  mermaidElements.forEach(element => {
    const originalCode = element.getAttribute('data-original-code')
    if (originalCode) {
      element.innerHTML = originalCode
      element.classList.remove('mermaid-rendered', 'mermaid-dark', 'mermaid-light')
    }
  })

  // 重新初始化
  setTimeout(() => {
    KEEP.utils.mermaidInit()
  }, 100)
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  if (typeof mermaid !== 'undefined') {
    // 延迟执行，确保所有元素都已加载
    setTimeout(() => {
      KEEP.utils.mermaidInit()
    }, 100)
  }
})

// PJAX 支持
if (typeof KEEP !== 'undefined' && KEEP.theme_config?.pjax?.enable === true) {
  document.addEventListener('pjax:success', () => {
    if (typeof mermaid !== 'undefined') {
      // PJAX 加载后重新初始化
      setTimeout(() => {
        KEEP.utils.mermaidInit()
      }, 100)
    }
  })
} 