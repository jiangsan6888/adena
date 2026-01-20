// 当前数据备份 - 2026-01-16
// 用于恢复到当前的数据状态

// 完整的初始数据结构
const INITIAL_DATA_BACKUP = {
    users: {
        'admin': {
            username: 'admin',
            email: 'admin@system.com',
            password: 'admin',
            isAdmin: true,
            registeredDate: '2024-01-01'
        }
    },
    games: [
        {id: 1, name: '아이온2', image: 'img/아이온.jpg'},
        {id: 2, name: '리니지2', image: 'img/리니지2.jpg'},
        {id: 3, name: '리니지M', image: 'img/리니지m.jpg'}
    ],
    products: [
        {id: 1, name: '满级神装 3000战力', server: '天启[天族]', unit: '件', price: 899, stock: 5, category: '装备', seller: '装备专卖', gameId: 1},
        {id: 2, name: '游戏币 手工打金', server: '荣耀[魔族]', unit: '万', price: 320, stock: 999, category: '游戏币', seller: '游戏币商', gameId: 1},
        {id: 3, name: '满级账号 2800战力', server: '永恒[天族]', unit: '个', price: 1599, stock: 1, category: '账号', seller: '账号商', gameId: 1}
    ],
    servers: [
        {id: 1, name: '天启[天族]', gameId: 1},
        {id: 2, name: '荣耀[魔族]', gameId: 1},
        {id: 3, name: '永恒[天族]', gameId: 1}
    ]
};

// 恢复数据的方法
function restoreFromBackup() {
    // 使用备份数据覆盖当前的localStorage
    localStorage.setItem('game_trade_users', JSON.stringify(INITIAL_DATA_BACKUP.users));
    localStorage.setItem('game_trade_games', JSON.stringify(INITIAL_DATA_BACKUP.games));
    localStorage.setItem('game_trade_products', JSON.stringify(INITIAL_DATA_BACKUP.products));
    localStorage.setItem('game_trade_servers', JSON.stringify(INITIAL_DATA_BACKUP.servers));
    
    // 清除当前用户登录状态
    localStorage.removeItem('game_trade_current_user');
    
    console.log('数据已恢复到备份状态！');
    alert('数据已恢复到备份状态！页面将刷新。');
    window.location.reload();
}

// 使用说明：
// 1. 将此文件中的INITIAL_DATA_BACKUP替换到myadena.html中的INITIAL_DATA变量
// 2. 或者在浏览器控制台中执行restoreFromBackup()函数
// 3. 或者直接将以下代码复制到浏览器控制台执行：
/*
const INITIAL_DATA_BACKUP = { /* 复制上面的完整对象 */ };
localStorage.setItem('game_trade_users', JSON.stringify(INITIAL_DATA_BACKUP.users));
localStorage.setItem('game_trade_games', JSON.stringify(INITIAL_DATA_BACKUP.games));
localStorage.setItem('game_trade_products', JSON.stringify(INITIAL_DATA_BACKUP.products));
localStorage.setItem('game_trade_servers', JSON.stringify(INITIAL_DATA_BACKUP.servers));
localStorage.removeItem('game_trade_current_user');
window.location.reload();
*/
