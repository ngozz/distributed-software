let window;

//URL có hash (dấu thăng #) tức là đang ở trang nhận
if (window.location.hash) { //chuyển từ trang gửi sang trang nhận khi có # trong url
    document.getElementById('upPage').style.display = 'none';
    document.getElementById('downPage').style.display = 'inline-block';
}
function init() { //hàm đầu tiên. nếu ở trang file thì gửi file từ local lên sử dụng upload-element package
    window = new WebTorrent();
    window.on('warning', logError);
    window.on('error', logError);
    const upload = document.querySelector('#upload');
    uploadElement(upload, (err, results) => {
        if (err) {
            logError(err)
            return
        }
        const files = results.map(result => result.file);
        seedTorrent(files);
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
