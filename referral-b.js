const DB = require("../models")
const moment = require('moment');
const Utils = require("../config/utils")
const _ = require('lodash');
const getReferral = async (req, res) => {
    let dataReferral = await DB.User.find({p_node: req.user._id}).select('name email createdAt balance level').sort({ _id: -1 }).exec();
    
    // if(req.params.type && req.params.type != undefined){
    //     if(req.params.type == '1'){
    //         dataHistory = await DB.History.find({userId: req.user._id, wallet: "Profit daily"}).sort({ _id: -1 }).exec();
    //     }
    // }
    res.render('account/referral', {layout: 'layout_account', dataReferral});
}
const getBinaryTree = async (req, res) => {
    let data = {
        uid: req.user._id
    }
    res.locals.page = 'binary_tree'
    res.render('account/binary_tree', {layout: 'layout_account', data});
}

const countBinary = async(req,res)=>{
    try {
        let user_left = await total_binary_left(req.user._id)
        let user_right = await total_binary_right(req.user._id)
        return res.json({
            data : {left: user_left.length, right: user_right.length},
            isSuccess : true
        })
    } catch (error) {
        return res.json({
            data : {left: 0, right: 0},
            isSuccess : false
        })
    }
};

const total_binary_left= async(userId)=>{
    let user = await DB.User.findOne({_id: userId}), count_left = 0, arrLeft = [];
    if (user.left != null){
        let id_left_all = user.left + await get_id_tree(user.left)
        count_left = id_left_all.split(',').length
        arrLeft = id_left_all.split(',');
        // console.log('id_left_all', id_left_all)
    }
    return arrLeft
}
const total_binary_right=async(userId)=>{
    let user = await DB.User.findOne({_id: userId}), count_right = 0, arrRight = [];
    if (user.right != null){
        let id_right_all = user.right + await get_id_tree(user.right)
        count_right = id_right_all.split(',').length
        arrRight = id_right_all.split(',')
        // console.log('id_right_all', id_right_all, id_right_all.split(',').length)
    }
    return arrRight
}
const get_id_tree=async(userId)=>{
    let listId = '';
    let users = await DB.User.find({p_binary: userId})
    for (const x of users) {
        listId += ','+ x._id
        listId += await get_id_tree(x._id)
    }  
    return listId
}

const JonTreeBinary = async (req, res) =>{
    try {
        let uid = req.body.id_user || req.user._id
        let Json = await reduceTreeBinary(uid)
        res.json(Json);
    } catch (error) {
        console.log(error)
    }
}
const reduceTreeBinary = async (userId) =>{
    try {
        let user =  await  DB.User.findOne({_id: userId})
        let json = [], user_sponser = '', tree = {};
        // let Invest = await this.SumInvested(userId)
        tree = {
            "id":user._id,
            'sponsor': await get_sponsor(user.p_node),
            "name": user.name,
            "email":user.email,
            "invest": user.balance.total_invest,
            'level': user.level,
            'team_left': user.balance.team_left,
            'team_right': user.balance.team_right,
            'total_team_left': user.balance.total_team_left,
            'total_team_right': user.balance.total_team_right,
            "fl":1,
            "iconCls":"level2",
            'children' : [],
            "state": '84'
        }
       
        json.push(tree)
        

        // console.log(child);
        return await children_treeBinary(tree)
    } catch (error) {
        console.log(error)
    }
}
const get_sponsor = async (userId) => {
    try {
        let sponsor;
        if(userId){
            sponsor = await DB.User.findOne({_id: userId})
        }
        return sponsor ? sponsor.name : "";
    } catch (error) {
        console.log(error);
        
    }
}
const children_treeBinary = async (json) => {
    try {
        let user = await DB.User.findOne({_id: json.id}),
        tree = {}, fl = 0
        let sponsor = '';
        if (user.left){
            let user_left =  await DB.User.findOne({_id: user.left, p_binary: json.id})
            fl = json.fl + 1
            // let Invest = await this.SumInvested(user_left._id)
            sponsor = await get_sponsor(user_left.p_node)
            tree = {
                "id":user_left._id,
                'sponsor': sponsor,
                "email":user_left.email,
                "name": user_left.name,
                "invest": user_left.balance.total_invest,
                'level': user_left.level,
                'team_left': user_left.balance.team_left,
                'team_right': user_left.balance.team_right,
                'total_team_left': user_left.balance.total_team_left,
                'total_team_right': user_left.balance.total_team_right,
                "fl":fl,
                "iconCls":"level2 left",
                "position":"left",
                'children' : [],
                "state": '84'
            }
            if (fl < 6)
                json['children'].push(tree)
                await  children_treeBinary(tree)
        }else{
            fl = json.fl + 1
            tree = {
                "id":'-1',
                "p_binary":json['id'],
                "empty": true,
                "fl":fl,
                "iconCls":"level2 left",
                "position":"left",
                "state": null
            }
            if (fl < 6)
                json['children'].push(tree)
        }

        if (user.right){
            let user_right =  await DB.User.findOne({_id: user.right, p_binary: json.id})
            fl = json.fl + 1
            // let Invest = await this.SumInvested(user_right._id)
            sponsor = await get_sponsor(user_right.p_node)
            tree = {
                "id":user_right._id,
                'sponsor': sponsor,
                "email":user_right.email,
                "name": user_right.name,
                "invest": user_right.balance.total_invest,
                'level': user_right.level,
                'team_left': user_right.balance.team_left,
                'team_right': user_right.balance.team_right,
                'total_team_left': user_right.balance.total_team_left,
                'total_team_right': user_right.balance.total_team_right,
                "fl":fl,
                "iconCls":"level2 right",
                'children' : [],
                "position":"right",
                "state": '84'
            }
            if (fl < 6)
                json['children'].push(tree)
                await  children_treeBinary(tree)
        }else{
            fl = json.fl + 1
            tree = {
                "id":'-1',
                "p_binary":json['id'],
                "empty": true,
                "iconCls":"level2 right",
                "position":"right",
                "fl":fl,
                "state": null
            }
            if (fl < 6)
                json['children'].push(tree)
        }
        return json
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getReferral,
    JonTreeBinary,
    getBinaryTree,
    countBinary,
    total_binary_left,
    total_binary_right
}
