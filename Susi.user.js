// ==UserScript==
// @name         Suzi
// @namespace    KrzysztofKruk-FlyWire
// @version      0.1
// @description  Helps with resolving misalignments
// @author       Krzysztof Kruk
// @match        https://ngl.flywire.ai/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ChrisRaven/FlyWire-Suzi/main/Suzi.user.js
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/FlyWire-Suzi/main/Suzi.user.js
// @homepageURL  https://github.com/ChrisRaven/FlyWire-Suzi
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
    events: {}
  })
}


function generateHTML() {
  return /*html*/`
    <button>Capture</button>
    <button>Show</button>
    <button>Delete</button>
    <input type="range">Opacity</input>
  `
}

function generateCSS() {}