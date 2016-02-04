function jq_cmd(cmdName, data, next) { 

    var cmd = {};
    cmd.cmd = cmdName;
    cmd.data = JSON.stringify(data);
    var obj;
    if (WEB_API.indexOf('amazonaws') > 0)
        obj = JSON.stringify(cmd);
    else
        obj = cmd;

    $.post(WEB_API,obj, next);

}
