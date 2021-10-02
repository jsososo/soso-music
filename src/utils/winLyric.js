import { reactive, ref, toRaw, watch } from 'vue';
import Storage from './Storage';

export const info = ref(
  Storage.get('soso_music_win_lyric', true, {
    index: 0,
    list: [],
    keys: [],
  }),
);

export const setting = reactive(
  Storage.get('win_lyric_setting', true, {
    LOCK: false,
    COLOR_1: '#409EFF',
    COLOR_2: '#67C23A',
    FONT_SIZE: 30,
    ROWS: 2,
    COLOR_ARROW: 'bottom',
    TEXT_ALIGN: 'text-left',
    TRANS: false,
  }),
);

export const openType = ref('');

watch(setting, () => Storage.set('win_lyric_setting', toRaw(setting), true), { deep: true });

window.addEventListener('storage', (e) => {
  if (e.key === 'soso_music_win_lyric') {
    info.value = JSON.parse(e.newValue);
  }
  if (e.key === 'win_lyric_setting') {
    Object.assign(setting, Storage.get('win_lyric_setting', true));
  }
});

export const resetWinLyric = () => {
  Storage.set('win_lyric_setting', {
    LOCK: false,
    COLOR_1: '#409EFF',
    COLOR_2: '#67C23A',
    FONT_SIZE: 30,
    ROWS: 2,
    COLOR_ARROW: 'bottom',
    TEXT_ALIGN: 'text-left',
    TRANS: false,
    RESET: true,
  });
};

export const predefineColor = ['#F56C6C', '#409EFF', '#67C23A', '#E6A23C', '#666666'];
