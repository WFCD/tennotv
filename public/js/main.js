const serviceAPI="https://api.warframestat.us/tennotv";let player,queue=[],lastInd=0,done=!0,ready=!1;const validToggles=["weapon","warframe","machinima","sfm","lore","talk"];function titleCase(e){e=e.toLowerCase().split(" ");for(var t=0;t<e.length;t++)e[t]=e[t].charAt(0).toUpperCase()+e[t].slice(1);return e.join(" ")}function addWatchedVideo(e){let t=JSON.parse(localStorage.getItem("watchedVideos")||"[]");t.push(e),localStorage.setItem("watchedVideos",JSON.stringify([...new Set(t)].filter(e=>null!==e)))}function getVideos(e){const t=JSON.parse(localStorage.getItem("watchedVideos")||"[]"),o=[`included_tags=${getCurrentToggles().join(",")}`,`excluded_video_ids=${t.concat(e?queue.map(e=>e.video_id):[]).join(",")}`],a={method:"GET",header:{"content-type":"application/json","user-agent":navigator.userAgent},credentials:"omit",referrer:"no-referrer"},n=`${serviceAPI}?${o.join("&")}`,d=new Request(n,a);fetch(d).then(e=>{if(e.ok)return e.json();console.error("[ERROR] Something went wrong fetching videos. Contact tennotv@warframe.gg for support.")}).then(e=>{processVideoData(e)}).catch(e=>{console.error(e)})}function makeTags(e){return $.map(e,e=>e?`<span class="badge badge-light">${titleCase(e)}</span>`:"").slice(0,5).join("")}function makeRow(e){return`<tr id="${e.video_id}" class="video-row">\n    <td scope="row" class="numRow col-md-1" style>${++lastInd}</th>\n    <td class="title col-md-6"><a href="${e.video_id}" target="_blank" rel="noopener" name="${e.video_title}">${e.video_title}</a></td>\n    <td class="author col-md-2"><a href="https://www.youtube.com/channel/${e.youtube_key}" name="${e.account_name}'s Channel" target="_blank" rel="noopener">${e.account_name}</a></td>\n    <td class="tags col-md-3">${makeTags(e.video_tag_ids)}</td>\n  </tr>`}function updatePlaylist(e){$.each(e,t=>{const o=e[t];$("#playlist").append(makeRow(o)),$(`#${o.video_id}`).click(()=>{startVideo(o.video_id,!0)}),$(`#${o.video_id} .title a`).click(e=>{e.preventDefault(),loadVideo(o.video_id)})})}function processVideoData(e){queue=queue.concat(e),updatePlaylist(e),ready&&done&&startVideo(e[0].video_id)}function resetPlayer(){$("#player").remove(),$("#playerWrapper").append('<div id="player">Loading player...</div>'),makeYTScripts()}function getNextVideoId(e){let t;return $.each(queue,function(o){queue[o].video_id===e&&(void 0!==queue[o+1]?t=queue[o+1].video_id:getVideos(!0))}),t}function loadVideo(e){$(".table-active").removeClass("table-active"),$(`#${e}`).addClass("table-active"),player.loadVideoById(e),addWatchedVideo(e),queue[queue.length-1].video_id===e&&getVideos(!0)}function onPlayerReady(e){e.target.playVideo()}function onPlayerStateChange(e){console.debug(`[State change] ${e.data}`);const t=player.getVideoUrl().match(/v=(.*)/i)[1];if(e.data==YT.PlayerState.ENDED&&!done){done=!0;const e=getNextVideoId(t);done=!1,loadVideo(e)}}function stopVideo(){player.stopVideo()}function onYouTubeIframeAPIReady(){ready=!0,console.debug("[DEBUG] onYouTubeIframeAPIReady called")}function makeYTScripts(){var e=document.createElement("script");e.src="https://www.youtube.com/iframe_api";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}function startVideo(e){!player&&ready&&(done=!1,player=new YT.Player("player",{videoId:e,events:{onReady:onPlayerReady,onStateChange:onPlayerStateChange},playerVars:{modestbranding:1,widget_referrer:"https://tenno.tv"}}),addWatchedVideo(e)),player&&ready&&done&&loadVideo(e)}function toggleStatus(e,t){localStorage.setItem(e,t)}function getCurrentToggles(){const e=[];return validToggles.forEach(t=>{null!==localStorage.getItem(t)&&e.push(t)}),e}function loadToggles(){validToggles.forEach(e=>{const t=localStorage.getItem(e);t&&"off"===t?($(`#toggle-${e}-check`).prop("checked",!1),$(`#toggle-${e}`).removeClass("active")):t&&($(`#toggle-${e}-check`).prop("checked",!0),$(`#toggle-${e}`).addClass("active")),t||(localStorage.setItem(e,"on"),$(`#toggle-${e}-check`).prop("checked",!0),$(`#toggle-${e}`).addClass("active"))})}function handleOptionClick(e){const t=e.target.id.replace(/toggle\-/gi,"").replace(/\-check/gi,"");let o=$(`#toggle-${t}-check`).prop("checked")?"off":"on";console.debug(`[DEBUG] clicked ${t} toggle: ${e.target.id}, new status: ${o}`),"on"===o&&$(`#toggle-${t}-check`).prop("checked",!0),localStorage.setItem(t,o)}makeYTScripts(),$(document).ready(function(){$(".opts-h").on("click",handleOptionClick),$(function(){$("label.opts-h").tooltip({placement:"bottom",title:"Click to Toggle"})}),loadToggles(),$(".btn-reset").on("click",e=>{switch($(e.currentTarget).attr("data-reset")){case"all":validToggles.forEach(e=>localStorage.removeItem(e)),localStorage.removeItem("watchedVideos");break;case"toggles":validToggles.forEach(e=>localStorage.removeItem(e));break;case"videos":localStorage.removeItem("watchedVideos")}window.location.reload(!0)}),$(".navbar-brand").on("click",()=>{window.location.reload(!0)})}),getVideos(!0);