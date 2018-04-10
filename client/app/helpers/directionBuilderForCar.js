export default function buildDirection(data) {
    const DirectionsService = new google.maps.DirectionsService();
    console.log("in map");
    console.log("here", data);
    let points = Object.keys(data).map(p => Object.assign(data[p], { data: p }))
    console.log("here 1", points.length);
    let firstPoint = new google.maps.LatLng(points[0].lat, points[0].lng);
    let lastPoint = new google.maps.LatLng(points[points.length - 1].lat, points[points.length - 1].lng);
    let waypointsArray = [];
    for (let i = 1; i < points.length - 1; i++) {
        waypointsArray.push({ location: new google.maps.LatLng(points[i].lat, points[i].lng) })
    }
    console.log("here 1", waypointsArray);
    return new Promise((resolve, reject) => {
    

        DirectionsService.route({
            origin: firstPoint,
            destination: lastPoint,
            waypoints: waypointsArray,
            travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                resolve(result);
            }
            if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                let error = new Error("Incorrect data for route")
                reject(error);
            }
        });
    });
}