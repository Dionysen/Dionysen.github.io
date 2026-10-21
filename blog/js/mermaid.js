/**
 * Mermaid diagrams support
 * 每次渲染注入主题 frontmatter，并在渲染后强制修正颜色（避免 initialize 只生效一次 / SVG 内联 !important 覆盖站点 CSS）
 */

KEEP.utils.getMermaidThemeVariables = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // 关闭 darkMode 自动推算，避免 Mermaid 把深色 primaryColor 再提亮
      darkMode: false,
      background: '#1b1d23',
      primaryColor: '#2a2d36',
      primaryTextColor: '#e8e8e8',
      primaryBorderColor: '#5b9fd4',
      lineColor: '#9aa3b2',
      secondaryColor: '#32363f',
      secondaryTextColor: '#e8e8e8',
      secondaryBorderColor: '#5b9fd4',
      tertiaryColor: '#252830',
      tertiaryTextColor: '#e8e8e8',
      tertiaryBorderColor: '#4b5563',
      textColor: '#e8e8e8',
      mainBkg: '#2a2d36',
      nodeBkg: '#2a2d36',
      nodeBorder: '#5b9fd4',
      nodeTextColor: '#e8e8e8',
      edgeLabelBackground: '#252830',
      clusterBkg: '#22252c',
      clusterBorder: '#4b5563',
      titleColor: '#e8e8e8',
      actorBkg: '#2a2d36',
      actorBorder: '#5b9fd4',
      actorTextColor: '#e8e8e8',
      actorLineColor: '#9aa3b2',
      signalColor: '#9aa3b2',
      signalTextColor: '#e8e8e8',
      labelBoxBkgColor: '#252830',
      labelBoxBorderColor: '#5b9fd4',
      labelTextColor: '#e8e8e8',
      loopTextColor: '#e8e8e8',
      noteTextColor: '#e8e8e8',
      noteBorderColor: '#5b9fd4',
      noteBkgColor: '#32363f',
      activationBorderColor: '#5b9fd4',
      activationBkgColor: '#32363f',
      sequenceNumberColor: '#1b1d23',
      stateBkg: '#2a2d36',
      stateBorder: '#5b9fd4',
      stateTextColor: '#e8e8e8'
    }
  }

  return {
    darkMode: false,
    background: '#ffffff',
    primaryColor: '#eef2ff',
    primaryTextColor: '#1f2937',
    primaryBorderColor: '#6366f1',
    lineColor: '#6366f1',
    secondaryColor: '#f1f5f9',
    secondaryTextColor: '#1f2937',
    tertiaryColor: '#f8fafc',
    tertiaryTextColor: '#1f2937',
    textColor: '#1f2937',
    mainBkg: '#eef2ff',
    nodeBkg: '#f8fafc',
    nodeBorder: '#6366f1',
    nodeTextColor: '#1f2937',
    clusterBkg: '#f1f5f9',
    clusterBorder: '#4f46e5',
    edgeLabelBackground: '#ffffff'
  }
}

KEEP.utils.isMermaidDarkMode = () => {
  if (document.body.getAttribute('data-theme') === 'dark') return true
  if (document.body.classList.contains('dark-mode')) return true
  if (typeof KEEP !== 'undefined' && KEEP.styleStatus?.isDark === true) return true
  return false
}

KEEP.utils.buildMermaidDefinition = (rawCode, isDarkMode) => {
  const vars = KEEP.utils.getMermaidThemeVariables(isDarkMode)
  // YAML frontmatter：每次渲染独立套主题，不依赖 initialize 是否只生效一次
  const lines = [
    '---',
    'config:',
    "  theme: 'base'",
    '  themeVariables:'
  ]
  Object.keys(vars).forEach((key) => {
    const value = vars[key]
    if (typeof value === 'string') {
      lines.push(`    ${key}: '${value}'`)
    } else {
      lines.push(`    ${key}: ${value}`)
    }
  })
  lines.push('---')
  lines.push(rawCode.trim())
  return lines.join('\n')
}

KEEP.utils.applyMermaidSvgColors = (element, isDarkMode) => {
  const svg = element.querySelector('svg')
  if (!svg) return

  const colors = isDarkMode
    ? {
        nodeFill: '#2a2d36',
        nodeStroke: '#5b9fd4',
        text: '#e8e8e8',
        edge: '#9aa3b2',
        clusterFill: '#22252c',
        clusterStroke: '#4b5563',
        labelBg: '#252830',
        bg: '#1b1d23'
      }
    : {
        nodeFill: '#eef2ff',
        nodeStroke: '#6366f1',
        text: '#1f2937',
        edge: '#6366f1',
        clusterFill: '#f1f5f9',
        clusterStroke: '#4f46e5',
        labelBg: '#ffffff',
        bg: '#ffffff'
      }

  svg.style.backgroundColor = colors.bg

  // 必须插到 SVG 末尾，才能盖过 Mermaid 自带的 !important 内嵌样式
  const styleId = 'keep-mermaid-force-style'
  let styleEl = svg.querySelector(`#${styleId}`)
  if (!styleEl) {
    styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleEl.setAttribute('id', styleId)
    svg.appendChild(styleEl)
  }
  styleEl.textContent = `
    .node rect, .node circle, .node ellipse, .node polygon, .node path,
    .basic.label-container, .label-container, rect.label-container {
      fill: ${colors.nodeFill} !important;
      stroke: ${colors.nodeStroke} !important;
    }
    .edgePath .path, .edgePath path, .flowchart-link, .edge-thickness-normal {
      stroke: ${colors.edge} !important;
      fill: none !important;
    }
    marker path, .arrowheadPath, defs marker path {
      fill: ${colors.edge} !important;
      stroke: ${colors.edge} !important;
    }
    .cluster rect, .cluster-label rect {
      fill: ${colors.clusterFill} !important;
      stroke: ${colors.clusterStroke} !important;
    }
    .edgeLabel rect, .labelBkg, .edgeLabel .labelBkg {
      fill: ${colors.labelBg} !important;
    }
    text, tspan {
      fill: ${colors.text} !important;
    }
    .nodeLabel, .edgeLabel, .label, .label foreignObject div,
    foreignObject div, foreignObject span, span.nodeLabel {
      color: ${colors.text} !important;
    }
  `

  // 直接改属性 / style，去掉 Mermaid 写在 style="" 里的浅色 fill
  const paintNode = (el) => {
    el.removeAttribute('style')
    el.setAttribute('fill', colors.nodeFill)
    el.setAttribute('stroke', colors.nodeStroke)
    el.style.setProperty('fill', colors.nodeFill, 'important')
    el.style.setProperty('stroke', colors.nodeStroke, 'important')
  }

  svg.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon, .label-container').forEach(paintNode)

  svg.querySelectorAll('.edgePath path, .flowchart-link, path[class*="edge"]').forEach((el) => {
    el.style.setProperty('stroke', colors.edge, 'important')
    el.setAttribute('stroke', colors.edge)
  })

  svg.querySelectorAll('marker path, .arrowheadPath').forEach((el) => {
    el.style.setProperty('fill', colors.edge, 'important')
    el.style.setProperty('stroke', colors.edge, 'important')
    el.setAttribute('fill', colors.edge)
    el.setAttribute('stroke', colors.edge)
  })

  svg.querySelectorAll('text, tspan').forEach((el) => {
    el.style.setProperty('fill', colors.text, 'important')
    el.setAttribute('fill', colors.text)
  })

  svg.querySelectorAll('.nodeLabel, .edgeLabel, foreignObject div, foreignObject span').forEach((el) => {
    el.style.setProperty('color', colors.text, 'important')
  })
}

KEEP.utils.mermaidInit = () => {
  if (typeof mermaid === 'undefined') {
    return
  }

  const mermaidElements = document.querySelectorAll('.mermaid')
  if (mermaidElements.length === 0) {
    return
  }

  // 防止 module 脚本与 mermaid.js 同时触发造成重复渲染
  if (KEEP.utils._mermaidRendering) {
    return
  }
  KEEP.utils._mermaidRendering = true

  const isDarkMode = KEEP.utils.isMermaidDarkMode()
  const themeVariables = KEEP.utils.getMermaidThemeVariables(isDarkMode)

  // 只做一次基础初始化；主题靠每次 render 的 frontmatter + SVG 后处理
  if (!KEEP.utils._mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'base',
      themeVariables,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 15
      },
      sequence: {
        useMaxWidth: true,
        showSequenceNumbers: true
      },
      gantt: { useMaxWidth: true },
      pie: { useMaxWidth: true },
      state: { useMaxWidth: true },
      class: { useMaxWidth: true }
    })
    KEEP.utils._mermaidInitialized = true
  } else if (typeof mermaid.updateSiteConfig === 'function') {
    try {
      mermaid.updateSiteConfig({
        theme: 'base',
        themeVariables
      })
    } catch (e) {
      // ignore
    }
  }

  const tasks = []

  mermaidElements.forEach((element, index) => {
    // 已渲染过则跳过（主题切换会先清掉 class）
    if (element.classList.contains('mermaid-rendered') || element.classList.contains('mermaid-rendering')) {
      return
    }

    let graphDefinition = element.getAttribute('data-original-code')
    if (!graphDefinition) {
      graphDefinition = (element.textContent || element.innerText || '').trim()
      element.setAttribute('data-original-code', graphDefinition)
    }

    if (!graphDefinition) {
      return
    }

    element.classList.add('mermaid-rendering')
    const graphId = 'mermaid-' + index + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
    const definitionWithTheme = KEEP.utils.buildMermaidDefinition(graphDefinition, isDarkMode)

    tasks.push(
      mermaid
        .render(graphId, definitionWithTheme)
        .then(({ svg }) => {
          element.innerHTML = svg
          element.classList.remove('mermaid-rendering')
          element.classList.add('mermaid-rendered')
          element.classList.remove('mermaid-dark', 'mermaid-light')
          element.classList.add(isDarkMode ? 'mermaid-dark' : 'mermaid-light')
          KEEP.utils.applyMermaidSvgColors(element, isDarkMode)
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error)
          element.classList.remove('mermaid-rendering')
          element.innerHTML = '<div class="mermaid-error">图表渲染失败: ' + error.message + '</div>'
        })
    )
  })

  Promise.all(tasks).finally(() => {
    KEEP.utils._mermaidRendering = false
  })
}

KEEP.utils.mermaidThemeChange = () => {
  const mermaidElements = document.querySelectorAll('.mermaid')
  if (mermaidElements.length === 0) {
    return
  }

  mermaidElements.forEach((element) => {
    const originalCode = element.getAttribute('data-original-code')
    if (originalCode) {
      element.textContent = originalCode
    }
    element.classList.remove('mermaid-rendered', 'mermaid-dark', 'mermaid-light')
  })

  setTimeout(() => {
    KEEP.utils.mermaidInit()
  }, 50)
}

const runMermaidWhenReady = () => {
  const tryInit = () => {
    if (typeof mermaid === 'undefined') {
      return false
    }
    KEEP.utils.mermaidInit()
    return true
  }

  if (tryInit()) {
    return
  }

  // mermaid ESM 可能晚于 DOMContentLoaded
  let attempts = 0
  const timer = setInterval(() => {
    attempts += 1
    if (tryInit() || attempts > 40) {
      clearInterval(timer)
    }
  }, 100)
}

document.addEventListener('DOMContentLoaded', () => {
  // 等暗色模式初始化完成后再渲染
  setTimeout(runMermaidWhenReady, 150)
})

if (typeof KEEP !== 'undefined' && KEEP.theme_config?.pjax?.enable === true) {
  document.addEventListener('pjax:success', () => {
    setTimeout(runMermaidWhenReady, 150)
  })
}
