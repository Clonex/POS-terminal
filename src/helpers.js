export function api(endpoint = "")
{
    return fetch("http://46.101.158.65:443/" + endpoint).then(d => d.json());
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