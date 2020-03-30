const
    keycloak = require('keycloak-connect'),
    request = require('request-promise-native');

class customKeycloak extends keycloak {

    /**
     * Ajout de la méthode de contrôle d'autorisations présente
     * dans le librairie helper de keycloak
     * @param  {Any} args Ensemble des arguments de la méthode helper
     * @return {Any}      Retour de la méthode helper
     */
    entitlement(body) {
        return (req, res, next) => {
            let token = null;
            try {
                console.log(req.kauth);
                token = req.kauth.grant.access_token;
            } catch(err) {
                next();
                return;
            }

            request({
                uri: `http://localhost:8080/auth/realms/master/authz/entitlement/api`,
                body,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                json: true // Automatically parses the JSON string in the response
            })
            .then((res) => {
                console.log(res);
                next();
            });
        }
    }
}

module.exports = customKeycloak;
