
//FACEBOOK
window.fbAsyncInit = function () {
    FB.init({
        appId: '802240363220731',
        xfbml: true,
        version: 'v2.5'
    });
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


function GoogleLogin(googleUser) {
    var profile = googleUser.getBasicProfile();
    var data = {};
    LOGIN_INFO = data;
    data.LoginType = "Google";
    data.Token = googleUser.getAuthResponse().id_token;
    data.Name = profile.getName();
    data.UserID = profile.getId();
    data.Email = profile.getEmail();
    data.imageURL = profile.getImageUrl();
    
    jq_cmd('VerifyLogin', data, UserHasLogedIn );
}

function FaceBookLogin() {    
    FB.getLoginStatus(function (response) {
        var data = {};
        LOGIN_INFO = data;    
        data.LoginType = "FB";
        data.Token = response.authResponse.accessToken;
        data.UserID = response.authResponse.userID;
        data.imageURL = "https://graph.facebook.com/" + data.UserID + "/picture?type=normal"   
        FB.api('/me', function (me_response) {          
            data.Name = me_response.name;
            jq_cmd('VerifyLogin', data, UserHasLogedIn);
        });         
    });
}

function UserHasLogedIn(response) {
    
    if (response.status != 0) {
        console.log(data.errorMessage);
    }
    else {     
        USER_INFO = response.data;
        MAIN_SCOPE.UserInfo = USER_INFO;
        MAIN_SCOPE.UserLoggedIn = true;
        MAIN_SCOPE.$apply();
    }
}