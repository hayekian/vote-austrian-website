
var REFRESH_DATE = new Date();
var RACES;
var USERS;
var CURRENT_USER;
var DB = {};
function CtrlCandidates($scope, $route, $http, $location, $window, ngDialog) {
    HTTP = $http;
    $scope.Page = 'Candidates';
    
    $scope.DisplayWaitBanner();

    var time_since_last_update = ( (new Date()).getTime() - REFRESH_DATE.getTime() ) / 1000;

    if (RACES != null && time_since_last_update < 30) {
        UpdateTable();
        $scope.HideWaitBanner();
    }
    else {
        _COMMAND("GetData", null, function (response) {
            if (response.status != 0) {
                console.log(data.errorMessage);
            }
            else {
                PrepareData(response.data);
                UpdateTable();
                $scope.HideWaitBanner();
            }
        });
    }

  
}


function PrepareData(data) { 

    DB = data;
    RACES = data.Incumbents;

    USERS = data.Users;
    USERS.forEach(function (elem) {
        // create hash of race ids to users runing in them         
        if (DB[elem.race_id] == null) {
            var arr = [];
            arr.push(elem);
            DB[elem.race_id] = arr;
        }
        else
            DB[elem.race_id].push(elem);
    });
    // for every race use the race_id in global hash to see if there are candidates running there... if they are add reference to them in this race
    
    RACES.SenateRaces = {};
    RACES.StateDistricts = {};

    RACES.forEach(function (elem) {
        
      

        if (elem.race == 'S' && RACES.SenateRaces[elem.state] == null) {
            var s = elem.state;
            var l = s.length;
            RACES.SenateRaces[elem.state] = elem;

        }
        if (RACES.StateDistricts[elem.state] == null)
            RACES.StateDistricts[elem.state] = [];
        RACES.StateDistricts[elem.state].push(elem.district);


        if (DB[elem.race_id] != null) {
            elem.Austrians = CreateAustriansList(DB[elem.race_id]);
        }
        else
            elem.Austrians = "";
    });
    
   
    REFRESH_DATE = new Date();         

}

function UpdateTable() { 


    var table = $("#CandidateList").DataTable({
        "bLengthChange": true,
        "bInfo": true,
        "destroy": true,
        "bSort": true,
        "iDisplayLength": 10,
        "aLengthMenu": [
            [25, 50, 100, -1],
            [25, 50, 100, "All"]
        ],
        "bProcessing": true,
        "aaSorting": [
            [5, 'desc']
        ],
        "aaData": RACES,
        "aoColumns": [
            {
                "mData": "race"
            }, {
                "mData": "district"
            },

            {
                "mData": "state"
            },
            {
                "mData": "inc"
            },
            {
                "mData": "party"
            },

            {
                "mData": "Austrians"
            }
        ]
    });

}

function ShowAustrian(user_id) {
    
    CURRENT_USER = Enumerable.From(USERS).Where(function (i) { return i.user_id == user_id; }).ToArray()[0];
    
    var s = angular.element('#AllRaces').scope();
    if (s != null)
        s.ShowCandidateInfo();
    return false;
   

}

function CreateAustriansList(austrians) { 

    var list = "";
    var img = "";
    austrians.forEach(function (elem) {
        img = "";
        if (elem.image != null && elem.image.length > 10) {
            img = '<img src="' + elem.image + '"/><br/>';
        }
        list += '<div class="cand" >' + img + '<a href="#" onclick="return ShowAustrian(' + elem.user_id + ')">' + elem.Name + "</a></div>";

    });

    return list;

}
