// ==UserScript==
// @name         Susi
// @namespace    KrzysztofKruk-FlyWire
// @version      0.1
// @description  Helps with resolving misalignments
// @author       Krzysztof Kruk
// @match        https://ngl.flywire.ai/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ChrisRaven/FlyWire-Susi/main/Susi.user.js
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/FlyWire-Susi/main/Susi.user.js
// @homepageURL  https://github.com/ChrisRaven/FlyWire-Susi
// ==/UserScript==

if (!document.getElementById('dock-script')) {
  let script = document.createElement('script')
  script.id = 'dock-script'
  script.src = typeof DEV !== 'undefined' ? 'http://127.0.0.1:5501/FlyWire-Dock/Dock.js' : 'https://chrisraven.github.io/FlyWire-Dock/Dock.js'
  document.head.appendChild(script)
}

let wait = setInterval(() => {
  if (globalThis.dockIsReady) {
    clearInterval(wait)
    main()
  }
}, 100)


function main() {
  let dock = new Dock()

  dock.addAddon({
    name: 'Susi',
    id: 'susi',
    css: generateCSS(),
    html: generateHTML(),
    events: {
      '#susi-buttons .capture': {
        click: capture
      },
      '#susi-buttons .toggle': {
        click: toggle
      },
      '#susi-buttons .delete': {
        click: remove
      },
      '#susi-opacity': {
        input: e => opacityInput(e),
        change: e => opacityChange(e)
      }
    }
  })

  readFromLS()
}


function readFromLS() {
  let opacity = Dock.ls.get('susi-opacity')
  if (opacity) {
    document.getElementById('susi-opacity').value = opacity
  }
}


let isVisible = false
let imageId = 'kk-utilities-compare-image'


function capture() {
  let src = viewer.display.canvas
  let srcCtx = viewer.display.gl
  let srcComputedStyles = getComputedStyle(src)
  let viewportOffset = src.getBoundingClientRect()
  let rightSideBarWidth = parseInt(document.getElementsByClassName('ngSidebarHeader')[0].style.width, 10)
  
  // to schedule redraw and fill the buffer, from which the redraw will happen
  viewer.display.scheduleRedraw()
  // to add our code before the Neuroglancer code executes the redraw (FIFO) and clears the buffer
  requestAnimationFrame(() => {
    src.toBlob(blob => {
      let srcWidth = parseInt(srcComputedStyles.getPropertyValue('width'), 10) - rightSideBarWidth
      let srcHeight = parseInt(srcComputedStyles.getPropertyValue('height'), 10)
      let tgt = document.getElementById(imageId)
      if (!tgt) {
        tgt = document.createElement('canvas')
        tgt.id = imageId
        tgt.width = srcWidth / 2
        tgt.height = srcHeight

        tgt.style.width = srcWidth / 2 + 'px'
        tgt.style.height = srcHeight + 'px'
        tgt.style.left = viewportOffset.left + srcWidth / 2 - 5 + 'px'
        tgt.style.top = viewportOffset.top + 'px'
        tgt.style.opacity = document.getElementById('susi-opacity')?.value || 0.8
      }

      let url = URL.createObjectURL(blob)
      let tempImg = document.createElement('img')
      tempImg.onload = function() {
        
        URL.revokeObjectURL(url)
        tgt.getContext('2d').drawImage(this, 0, 0, srcWidth / 2 + 5, srcHeight, 0, 0, srcWidth / 2 + 5, srcHeight)
        tempImg.remove()
      };
      tempImg.src = url
      document.body.appendChild(tgt)
    })
  });

  isVisible = true
  changeButtonsAvailability(true)
  updateToggleButton()
  updateToggleState()
}


function changeButtonsAvailability(state) {
  document.querySelector('#susi .toggle').disabled = !state
  document.querySelector('#susi .delete').disabled = !state
}


function updateToggleButton() {
  let toggleButton = document.querySelector('#susi .toggle')
  if (toggleButton) {
    toggleButton.textContent = isVisible ? 'Hide' : 'Show'
  }
}


function updateToggleState() {
  let image = document.getElementById(imageId)
  if (image) {
    image.style.display = isVisible ? 'block' : 'none'
  }
}


function toggle() {
  isVisible = !isVisible

  updateToggleButton()
  updateToggleState()
}


function remove() {
  let image = document.getElementById(imageId)
  if (image) {
    image.remove()
    isVisible = false
    updateToggleButton()
    changeButtonsAvailability(false)
  }
}


function opacityInput(e) {
  let image = document.getElementById(imageId)
  if (image) {
    image.style.opacity = e.target.value
  }
}


function opacityChange(e) {
  Dock.ls.set('susi-opacity', e.target.value)
}


function generateHTML() {
  return /*html*/`
    <div id="susi-buttons">
      <button class="capture">Capture</button>
      <button class="toggle" disabled>Show</button>
      <button class="delete" disabled>Delete</button>
    </div>
    <input id="susi-opacity" type="range" title="Opacity" min=0 max=1 step=0.01 value=0.8>
  `
}

function generateCSS() {
  return /*css*/`
    #susi {
      width: 145px;
      text-align: center;
    }

    #susi-buttons {
      display: flex;
      justify-content: space-between;
      
    }

    #susi-buttons button {
      font-size: 12px;
      padding-left: 3px;
      padding-right: 3px;
    }

    #${imageId} {
      position: absolute;
      z-index: 1;
      opacity: 0.8;
    }
  `
}
