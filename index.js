let client;

//URL có hash (dấu thăng #) tức là đang ở trang nhận
if (window.location.hash) { //chuyển từ trang gửi sang trang nhận khi có # trong url
    document.getElementById('upPage').style.display = 'none';
    document.getElementById('downPage').style.display = 'inline-block';
}

function init() { //hàm đầu tiên. nếu ở trang file thì gửi file từ local lên sử dụng upload-element package
    client = new WebTorrent();
    client.on('warning', logError);
    client.on('error', logError);
    const upload = document.querySelector('#upload');
    uploadElement(upload, (err, results) => {
        if (err) {
            logError(err)
            return
        }
        const files = results.map(result => result.file);
        seedFiles(files);
    })
}

window.addEventListener('load', function () { //sau khi trang load xong sẽ chạy check()
    check();
})

function check() { //nếu ở trang nhận thì bỏ dấu hash và chạy function downloadTorrent
    var autoDownload = window.location.hash.substr(1) ? true : false; //window.location.hash returns the anchor of the url (sau #, bao gồm dấu #)
    if (autoDownload) {
        downloadTorrent(window.location.hash.substr(1)); //pass anchor (infohash) không có hash tới downloadTorrent)
    }
}

function downloadTorrent(infohash) { //tải torrent
    document.getElementById("upPage").style.display = "none";
    const announce = createTorrent.announceList;
    //AnnounceList là một phần không bắt buộc trong metadata file của torrent bao gồm địa chỉ các tracker.
    //createTorrent.announceList là AnnounceList cho trước mặc định nếu metadata của torrent không có.
    client.add(infohash, { announce }, addTorrent);
    log(`<p id="downloading">Downloading ...</p>`);
}

function addTorrent(torrent) {
    torrent.on('warning', logError);
    torrent.on('error', logError);

    const speed = document.querySelector('#speed')
    speed.style.display = "block";
    // Hiện tốc độ tải xuống
    updateSpeed(torrent);
    // Cập nhật tốc độ tải xuống mỗi giây một lần
    const interval = setInterval(() => {
        updateSpeed(torrent);
    }, 1000)
    // Khi torrent tải xong, cập nhật lần cuối và ngừng gọi updateSpeed()
    torrent.on('done', () => {
        updateSpeed(torrent);
        clearInterval(interval);
        document.getElementById('downloading').remove();
    })
    const torrentIds = torrent.magnetURI.split('&');
    const torId = torrentIds[0].split(':')
    const hash = torId[3]

    //Hiển thị link nhận
    let torrentLog = `<section class="torrent-log">
    <p class="link-label">Share link</p>
    <div class="link-and-copy">
      <p class="link" style="text-transform:lowercase;">${window.location.href}#${hash}</p>
      <span class="copy" onclick="copyLink(this)">Copy</span>
    </div>
    <p class="files-label">Files <span class="number-of-files">${torrent.files.length}</span></p>
    <div class="file-list"></div>
  </section>`
    log(torrentLog);

    torrent.files.forEach(file => {
        // Thêm link nhận file
        file.getBlobURL((err, url) => {
            if (err) {
                logError(err)
                return
            }
            // Tạo element link
            const a = document.createElement('a');
            a.href = url;
            a.textContent = file.name + ` (${prettierBytes(file.length)})`;
            // Tải file khi ấn vào
            a.download = file.name;
            let link = `<a href="${url}" download="${file.name}" onclick="this.classList.add('visited')">${file.name} <span class="file-size">${prettierBytes(file.length)}</span></a>`;
            document.getElementsByClassName('file-list')[0].insertAdjacentHTML('beforeEnd', link);

        })
    })
}

function seedFiles(files) { //nếu có file thì hiện cảnh báo không đóng web và seed torrent
    if (files.length === 0) return
    document.getElementById('note').style.visibility = 'visible';
    client.seed(files, addTorrent);
    //seed là một method từ thư viện WebTorrent. 
    //Gọi seed sẽ tạo torrent mới và seed lên mạng nội bộ. Các peer trong mạng sẽ có thể tải được file.
}

function copyLink(btn) { //Nút copy link trang web nhận
    navigator.clipboard.writeText(btn.previousElementSibling.innerText);
    btn.classList.add('copied');
    setTimeout(() => { btn.classList.remove('copied') }, 1100);
}

function updateSpeed(torrent) { //cập nhật tốc độ tải xuống
    const progress = (100 * torrent.progress).toFixed(0);
    const speed = `
          <div class="transfer-info">
              ${window.location.hash ? `<div class="progress"><div id="progressbar" style="width:${progress}%"></div>${progress}%</div>` : ``}
              <div class="live-stats">
                  <div><span class="label">Peers:</span> ${torrent.numPeers}</div>
                  <div><span class="label">Download speed:</span> ${prettierBytes(client.downloadSpeed)}/s</div>
                  <div><span class="label">Upload speed:</span> ${prettierBytes(client.uploadSpeed)}/s</div>             
              </div>                
          </div>
      `
    const speedInfo = document.querySelector('#speed');
    speedInfo.innerHTML = speed;
}

// Thêm văn bản vào trang
function log(element) {
    const log = document.querySelector('#log');
    log.insertAdjacentHTML('afterBegin', element);
}

//log error vào console
function logError(err) {
    console.log(err.message);
}

init()
