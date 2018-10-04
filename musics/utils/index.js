function formatDate(date,format = 'yyyy-MM-dd hh:mm:ss'){
    try{
        date = new Date(date)
    }catch(e){
        return null;
    }
    let times = {
        yyyy:date.getFullYear(),
        MM:('0' + (date.getMonth() + 1)).slice(-2),
        dd:('0' + date.getDate()).slice(-2),
        hh:('0' + date.getHours()).slice(-2),
        mm:('0' + date.getMinutes()).slice(-2),
        ss:('0' + date.getSeconds()).slice(-2)
    }
    return format.replace(/\w+/g,function(match){
        return times[match];
    })
}
exports.formatDate = formatDate;