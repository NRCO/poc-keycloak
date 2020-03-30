var keycloak = Keycloak('keycloak.json');

var loadData = function () {

    document.getElementById('token').innerHTML = JSON.stringify(keycloak.tokenParsed, null, 4);

    var url = 'http://localhost:27000/api/comments';
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);

    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var res = JSON.parse(req.responseText),
                    comments = res.data;

                var html = '';
                for (var i = 0; i < comments.length; i++) {
                    html += '<pre>' + JSON.stringify(comments[i], null, 4) + '</pre>';
                }
                document.getElementById('api-result').innerHTML = html;
                console.log('finished loading data');
            }
        }
    }

    req.send();
};

var loadFailure = function () {
    document.getElementById('customers').innerHTML = '<b>Failed to load data.  Check console log</b>';
};

var reloadData = function () {
    keycloak.updateToken(10)
    .success(loadData)
    .error(function() {
        document.getElementById('customers').innerHTML = '<b>Failed to load data.  User is logged out.</b>';
    });
}

keycloak.init({ onLoad: 'login-required' })
    .success(reloadData)
    .error(function(errorData) {
        document.getElementById('customers').innerHTML = '<b>Failed to load data. Error: ' + JSON.stringify(errorData) + '</b>';
    });
