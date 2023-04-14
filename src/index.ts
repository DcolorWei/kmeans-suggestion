import { Coordinate, kmeansSHT, closestMean, dist } from './kmeans'

const dataDeckOrigin: Array<Coordinate> = []
const kmeans = kmeansSHT(dataDeckOrigin)
const dataDeck = new Proxy(dataDeckOrigin, {
    set(target) {
        const { clusters, means } = kmeansSHT(target);
        kmeans.clusters = clusters;
        kmeans.means = means;
        return true
    }
})

//设置数据仓库
function setDataDeck(data: Array<Coordinate>) {
    data.forEach((item) => {
        dataDeck.push(item)
    })
}

function getSuggestion(data: Coordinate | Array<Coordinate>, suggestionNum = 5) {
    //检查data类型
    if (typeof data !== 'object' && !Array.isArray(data)) {
        throw new Error("parameter data must be an object or an array of objects, and the object's keys must be numbers")
    }
    let origin: Coordinate;
    if (Array.isArray(data)) {
        //计算平均向量
        origin = new Coordinate(data[0], true);
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            Object.keys(point).forEach((key) => {
                origin[key] += point[key];
            });
        }
    } else {
        origin = data;
    }
    //匹配最近的中心并对其进行排序
    const index = kmeans.means.indexOf(closestMean(origin, kmeans.means));
    kmeans.clusters[index].sort((a, b) => {
        return dist(a, origin) - dist(b, origin)
    })
    return kmeans.clusters[index].slice(0, suggestionNum);
}
export { dataDeck, setDataDeck, getSuggestion }