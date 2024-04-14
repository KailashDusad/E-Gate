const scanner = new Html5QrcodeScanner("reader", {  qrbox: {width: 250,height: 250}, fps: 20});
        scanner.render(success, error)

        function success(data){
            // let parsedData = JSON.parse(data);
            // let name = parsedData.name;
            // let email = parsedData.email;
            document.getElementById('data').innerHTML = `<h3>User Details:<span style='font-weight:bold; margin-left:10px'>${data}</span></h3>`;
            // console.log(parsedData);
            scanner.clear();
            document.getElementById('reader').remove();
        }
        function error(err){console.log(err)}
