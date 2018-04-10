export default function buildDirection(data) {
    const DirectionsService = new google.maps.DirectionsService();
    console.log(data);
    return new Promise((resolve, reject) => {
        DirectionsService.route({
            origin: new google.maps.LatLng(data.departurePoint.lat, data.departurePoint.lng),
            destination: new google.maps.LatLng(data.arrivalPoint.lat, data.arrivalPoint.lng),
            travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            console.log("STATUS", status);
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