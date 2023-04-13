//坐标类
export class Coordinate {
    [key: string]: number;
    //根据传入的坐标对象，初始化坐标类的属性
    //若init为true，则代表实例化为原点
    constructor(point: Coordinate, init?: boolean) {
        Object.keys(point).forEach((key) => {
            this[key] = init ? 0 : point[key];
        });
    }
}


//K-means聚类
export function kmeans(data: Array<Coordinate>, k: number): { clusters: Array<Array<Coordinate>>, means: Array<Coordinate> } {
    //means是一个坐标对象数组，代表聚类中心
    let means: Array<Coordinate> = initMeans(data, k);
    //clusters是一个二维数组，每个元素是一个数组，数组中存放的是属于该类的数据点
    let clusters: Array<Array<Coordinate>> = [data];
    //last是一个坐标对象，代表上一次的聚类中心
    let lastMeans: any = null;
    //如果当前聚类中心和上一次的聚类中心相同，则说明聚类已经收敛，停止计算
    while (!equals(means, lastMeans)) {
        lastMeans = means;
        clusters = clusterData(data, means);
        means = updateMeans(clusters);
    }

    return { clusters, means }
}

//轮廓系数优化
export function kmeansSHT(data: Array<Coordinate>): { clusters: Array<Array<Coordinate>>, means: Array<Coordinate> } {
    const silhouetteList: Array<number> = [];
    let last = -1;
    let k = 1;

    while (++k < data.length) {
        let { clusters, means } = kmeans(data, k);
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const mean = closestMean(point, means);
            const meanIndex = means.indexOf(mean);
            const cluster = clusters[meanIndex];
            const a = cluster.reduce((sum, p) => {
                return sum + dist(point, p);
            }, 0) / cluster.length;
            const b = means.reduce((sum, mp, index) => {
                if (index === meanIndex) {
                    return sum;
                }
                const cluster = clusters[index];
                return sum + cluster.reduce((sum, p) => {
                    return sum + dist(point, p);
                }, 0) / cluster.length;
            }, 0) / (means.length - 1);

            silhouetteList.push((b - a) / Math.max(a, b));
        }
        const result = silhouetteList.reduce((sum, s) => {
            return sum + s;
        }, 0) / silhouetteList.length;
        if (result > last) {
            last = result;
        } else {
            return { clusters, means }
        }
    }
    return kmeans(data, data.length)
}

//初始化随机的聚类中心
function initMeans(data: Array<Coordinate>, k: number) {
    const means: Array<any> = [];
    const r = data.length;
    for (let i = 0; i < k; i++) {
        means.push(data[Math.floor(Math.random() * r)]);
    }
    return means;
}

//进行聚类
function clusterData(data: Array<Coordinate>, means: Array<Coordinate>) {
    const clusters: Array<Array<Coordinate>> = [];
    for (let i = 0; i < means.length; i++) {
        clusters.push([]);
    }
    for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const mean = closestMean(point, means);
        clusters[means.indexOf(mean)].push(point);
    }
    return clusters;
}

//计算最近的聚类中心
export function closestMean(point: Coordinate, means: Array<Coordinate>): Coordinate {
    //closestMean是一个坐标对象，代表最近的聚类中心，一开始默认为该类的第一个点
    let closestMean: Coordinate = means[0];
    let distance: number | null = null;
    //计算该点到每个聚类中心的距离，取最小的距离
    for (let i = 0; i < means.length; i++) {
        const mean = means[i];
        const d = dist(point, mean);
        if (distance === null || d < distance) {
            closestMean = mean;
            distance = d;
        }
    }
    return closestMean;
}
//更新聚类中心
function updateMeans(clusters: Array<Array<Coordinate>>) {
    const means: Array<any> = [];
    for (let i = 0; i < clusters.length; i++) {
        const clusterData = clusters[i];
        let sum = new Coordinate(clusterData[0], true);
        for (let j = 0; j < clusterData.length; j++) {
            const point = clusterData[j];
            Object.keys(point).forEach((key) => {
                sum[key] += point[key];
            });
        }
        //计算坐标点平均值
        Object.keys(sum).forEach((key) => {
            sum[key] /= clusterData.length;
        });
        means.push(sum);
    }
    return means;
}

//判断两组聚类中心是否相同
function equals(a: Array<Coordinate>, b: Array<Coordinate>) {
    if (a === b) {
        return true;
    }
    if (a === null || b === null || a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

//欧几里得距离
export function dist(a: Coordinate, b: Coordinate) {
    return Math.sqrt(Object.keys(a).reduce((sum, key) => {
        return sum + Math.pow(a[key] - b[key], 2);
    }, 0));
}