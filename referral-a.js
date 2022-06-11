findByNode: async function (id){
        let arr_user = null
        let creditedUsers = await this.findById(id).select('-password').exec();
        arr_user = {
            _id: creditedUsers._id,
            name: creditedUsers.username,
            children: []
        }
        return arr_user
    },
    findByChildNode: async function (node){
        let arr_user = []
        let creditedUsers = await this.find({"system.p_node": node}).exec();
        for(let user of creditedUsers){
            arr_user.push({
                _id: user._id,
                name: user.username,
                invested: user.wallet.ETH.invested,
                children: [],
                id  : user._id,
                text : user.username,
                state : {
                    selected  : false
                },
            })
        }
        return arr_user
    },
const getChildrens =  async (entity) => {
    let childs = await findByChildNode(String(entity._id));
    if(childs.length>0){
       entity.children = childs;
    }else{
       entity.type = "leaf";
    }
    for(let i in childs){        
       if (childs[i]){
           await getChildrens(childs[i]);
       }else{
           console.log("undifened found :"+i)
       }
    }
    return entity;    
}

const getReferral = async (req, res) => {
    let node = await userModel.findById(req.user._id).select("username _id wallet.ETH.invested")
    node = node.serialize()
    node.name=node.username;
    node.text=node.username;
    node.id=node._id;
    node.invested = node.wallet.ETH.invested;
    let child = await getChildrens(node)
    res.json(child)
}
