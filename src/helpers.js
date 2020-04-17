const SERVER_IP = "167.172.164.43";

export function api(endpoint = "")
{
    return fetch("http://" + SERVER_IP + ":443/" + endpoint).then(d => d.json());
}

export function doKey(key, target)
{
    if(key === -1)
    {
        target.value = target.value.substring(0, target.value.length - 1);
    }else{
        target.value += key;
    }

    target.focus();
}