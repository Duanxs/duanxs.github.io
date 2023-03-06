import {
  defineConfig, presetAttributify, presetIcons, presetTypography, presetUno,
} from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetTypography(),
    presetAttributify(),
    presetUno(),
  ],
  // transformers: [
  //   transformerDirectives(),
  //   transformerVariantGroup(),
  // ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
})
