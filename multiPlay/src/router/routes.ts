import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'MainLobby',
        component: () => import('pages/MainLobby.vue')
      },
      {
        path: 'coin-game',
        name: 'CoinGame',
        component: () => import('pages/CoinGame.vue')
      },
      {
        path: 'tictactoe-game',
        name: 'TicTacToe',
        component: () => import('pages/TicTacToeGame.vue')
      },
      {
        path: 'connectfour-game',
        name: 'ConnectFour',
        component: () => import('pages/ConnectFourGame.vue')
      },
      {
        path: 'breakthrough-game',
        name: 'Breakthrough',
        component: () => import('pages/BreakthroughGame.vue')
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
