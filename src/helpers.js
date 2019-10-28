export function api(endpoint = "")
{
    return fetch("http://46.101.158.65:443/" + endpoint).then(d => d.json());
}