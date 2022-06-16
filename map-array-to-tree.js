const mapArrayToTreeJson = (items, id = null, link = 'node') => {
    return items
        .filter((item) => item[link] === id)
        .map((item) => {
            const itemJSON = item;
            const child = mapArrayToTreeJson(items, itemJSON.id)
            return {
                ...itemJSON,
                children: child.length > 0 ? child : null,
            };
        });
};


const childTree = (arr, tree) => {
    const node = arr.find((item) => item["id"] === tree.id);
    let left = arr.find((item) => item["id"] === node.left);
    let right = arr.find((item) => item["id"] === node.right);

    if (left) {
        let child = {
            id: left.id,
            children: []
        }
        tree.children.push(child)
        childTree(arr, child)
    } else {
        tree.children.push({
            id: -1
        })
    }
    if (right) {
        let child = {
            id: right.id,
            children: []
        }
        tree.children.push(child)
        childTree(arr, child)
    } else {
        tree.children.push({
            id: -1
        })
    }
    return tree

}

const JsonTree = (arr) => {
    child = []
    let tree = arr[0];
    tree.children = []
    child.push(tree)
    return childTree(arr, tree)
}

const arr = [{ id: 1, name: "a", node: null, left: 2, right: 3 }, { id: 2, name: "a", node: 1, left: 4, right: null }, { id: 3, name: "a", node: 1, left: null, right: null }, { id: 4, name: "a", node: 2, left: 5, right: null }, { id: 5, name: "a", node: 4, left: null, right: null }]


const getChildren = (data, result, node) => {
    for (const item of data) {
        if (item.node === node) {
            console.log(item.id);
            const newItem = {
                ...item,
                children: []
            };
            result.push(newItem);
            getChildren(data, newItem.children, item.id);
        }
    }
};
const arrayToTree = (data, node = null) => {
    const result = [];
    getChildren(data, result, node);
    return result;
};


// let newa = mapArrayToTreeJson(arr)
// console.log("Tree 1::", JSON.stringify(newa));

// let _arr = JsonTree(arr)
// console.log("Tree 2::", JSON.stringify(_arr));

// let rt = arrayToTree(arr)
// console.log("Tree 2e::", JSON.stringify(rt));

const arrayToTree1 = (itemArray) => {
    return itemArray.filter((item) => {
        item["children"] = itemArray.filter((child) => item["id"] === child["node"]);
        return item["node"] === null;
    });
};
// console.log(JSON.stringify(arrayToTree1(arr)));


function arrayToTree2(arr) {
    let result = [], map = {};
    for (let item of arr) {
        map[item.id] = { ...item, children: [] };
    }
    for (let item of arr) {
        let id = item.id, node = item.node;
        let treeItem = map[id];
        if (node === null) {
            result.push(treeItem)
        } else {
            if (!map[node]) {
                map[node] = {
                    children: []
                }
            }
            map[node].children.push(treeItem)
        }
        // console.log(result, map);
    }
    return result
}

console.log(JSON.stringify(arrayToTree2(arr)));
