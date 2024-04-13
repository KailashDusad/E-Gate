const scanner = new Html5QrcodeScanner("reader", {  qrbox: {width: 250,height: 250}, fps: 20});
        scanner.render(success, error)
        function success(data){document.getElementById('data').innerHTML = `<h1>Scanned result</h1><p><a href="${data}">${data}</a></p>`;
        scanner.clear();
        document.getElementById('reader').remove();
    }
        function error(err){console.log(err)}
