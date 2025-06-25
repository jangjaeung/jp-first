declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.woff'
declare module '*.woff2'
declare module '*.ttf'
declare module '*.otf'
declare module '*.vtt'
declare module '*.webp'

/** SVG 컴포넌트 타입 선언 */
declare module '*.svg?react' {
    import * as React from 'react'
    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>
    export default ReactComponent
}

declare module '*.scss' {
    const content: { [className: string]: string }
    export = content
}
