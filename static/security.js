const scanner = new Html5QrcodeScanner("reader", {  qrbox: {width: 300,height: 300}, fps: 20});
        scanner.render(success, error)

        function success(data){
            let parsedData = JSON.parse(data);
            let name = parsedData.name;
            let email = parsedData.email;
            document.getElementById('data').innerHTML = `<h3>User Details: </h3><p style='display:flex'>Name: <span style='font-weight:bold; margin-left:10px'>${name}</span></p><p style='display:flex'>Email Id: <span style='font-weight:bold; margin-left:10px'>${email}</span></p>`;
            console.log(parsedData);
            scanner.clear();
            document.getElementById('reader').remove();
        }
        function error(err){console.log(err)}
