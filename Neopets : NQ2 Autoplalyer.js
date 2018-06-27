// ==UserScript==
// @name         Neopets : NQ2 Autoplayer
// @namespace    https://github.com/Sanada-Kouichi/
// @version      0.1
// @description  Autoplayer for Neo Quest II
// @author       Sanada-Kouichi
// @copyright    2018+, Sanada-Kouichi
// @license      GNU GPL
// @language     en
// @include      http://www.neopets.com/games/nq2/nq2.phtml
// @include      http://www.neopets.com/games/nq2/nq2.phtml*
// @icon           http://gm.wesley.eti.br/icon.php?desc=32041
// @connect      github.com
// @grant        GM_log
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    let path = '';
    let training = 0;
    let stopWalking = 0;

    let pathIndex = GM_getValue('pathIndex', 0);
    let header = document.getElementsByClassName('contentModuleHeader')[0];
    let randomEvent = document.getElementsByClassName('randomEvent')[0];

    if(!header || randomEvent)
    {
        location.href = 'nq2.phtml';
    } else {
        let frame = document.getElementsByClassName('frame')[0];
        let images = frame.getElementsByTagName('img');
        //let inv = false;
        let targ_item = 300;
        //frame.insertAdjacentHTML('beforebegin', '<p>' + GM_getValue(currentRohaneLevel, 1) + '</p>');
        function readLevel() {
            GM_setValue('currentRohaneLevel', +frame.getElementsByTagName('td')[6].innerHTML);
            if(GM_getValue('currentRohaneLevel') == 1 && pathIndex == path.length) GM_setValue('oldRohaneLevel',1);
        }

        function isTraining() {
            switch(GM_getValue('currentRohaneLevel')) {
                case 1: GM_setValue('path', '33321444');
                    break;
                case 2: GM_setValue('path', '3332211444');
                    break;
                case 3: GM_setValue('path', '333222111444');
                    break;
                case 4: GM_setValue('path', '333222211111444');
                    break;
                case 5: GM_setValue('path', '333222234341111444');
                    break;
                case 6: GM_setValue('path', '333222234343434343434343434341111444');
                    break;
                default:
                    if(training) {
                        GM_setValue('path','34');
                    } else {
                        GM_setValue('path', path);
                    }
            }
        }

        function checkHealth() {
            check: for(let img of images) {
                switch( img.src.slice(32) ) {
                    case 'exp_green':
                    case 'exp_yellow':
                    case 'exp_red':
                        if( img.width <= 42 ) { //max 75
                            GM_setValue('inv', true);
                            break check;
                        } else GM_setValue('inv', false);
                }
            }
        }

        function decidePath() {
            if(stopWalking) {
                GM_setValue('path', '');
                GM_setValue('pathIndex', 0);
                alert('You decided to stop.\n Deactivate the script to take control');
            } else if(GM_getValue('inv') && GM_getValue('currentRohaneLevel') > 4) {
                location.href = 'nq2.phtml?act=inv';
            } else if(pathIndex < GM_getValue('path').length) {
                location.href = 'nq2.phtml?act=move&dir=' + GM_getValue('path')[pathIndex];
                GM_setValue('pathIndex', ++pathIndex);
            } else {
                GM_setValue('pathIndex', 0);
                if(training) {
                    location.href = 'nq2.phtml?act=move&dir=3';
                } else alert('Finish');
            }
        }

        function selectPotion(targ_char) {
            let links = frame.getElementsByTagName('a');
            let j = ( targ_char == 1 || targ_item == 304 ) ? 0 : links.length - 1;
            while(true) {
                let str = links[j].href;
                if( str.includes(targ_item) ) {
                    if( targ_char == 3 ) {
                        for (let k = j; k > 0; k--) {
                        }
                    }
                    targ_item = str.slice( str.indexOf(targ_item), str.indexOf(targ_item) + 5);
                    j = ( targ_char == 1 || targ_item == 304 ) ? j + 1 : j - 1;
                }
            }
        }

        function healBeforeGo() {
            let targ_char = 0;
            healthBar: for(let img of images) {
                switch( img.src.slice(32) ) {
                    case 'exp_green':
                    case 'exp_yellow':
                    case 'exp_red':
                        targ_char++;
                        if( img.width ==  0) targ_item = 304;
                        if( img.width <= 42 ) {
                            selectPotion(targ_char);
                            break healthBar;
                        }
                }
            }
            location.href = 'nq2.phtml?act=inv&amp;iact=use&amp;targ_item=' + targ_item + '&amp;targ_char=' + targ_char;
        }

        function manyCases() {
            //http://www.neopets.com/games/nq2/nq2.phtml?act=skills&show_char=1
            //http://www.neopets.com/games/nq2/nq2.phtml?act=skills&show_char=1&buy_char=1&skopt_9502=1
            //http://www.neopets.com/games/nq2/nq2.phtml?act=skills&buy_char=1&buy_char=1&confirm=1&skopt_9502=1
            if( GM_getValue('inv') ) {
                healBeforeGo();
            } else location.href = 'nq2.phtml';
        }

        main: for(let i = images.length - 1; i >= 0; i--) {
            switch( images[i].src.slice(32) ) {
                case 'nav.gif':
                    readLevel();
                    if(pathIndex == 0) isTraining();
                    checkHealth();
                    decidePath();
                    break main;
                case 'tomap.gif':
                    manyCases();
                    break main;
            }
        }
    }
})();
