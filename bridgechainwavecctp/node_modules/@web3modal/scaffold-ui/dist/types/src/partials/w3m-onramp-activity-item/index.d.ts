import { LitElement } from 'lit';
import type { ColorType } from '@web3modal/ui/src/utils/TypeUtil.js';
export declare class W3mOnRampActivityItem extends LitElement {
    static styles: import("lit").CSSResult[];
    disabled: boolean;
    color: ColorType;
    label: string;
    purchaseValue: string;
    purchaseCurrency: string;
    date: string;
    completed: boolean;
    inProgress: boolean;
    failed: boolean;
    onClick: (() => void) | null;
    symbol: string;
    icon?: string;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private fetchTokenImage;
    private statusIconTemplate;
    private errorIconTemplate;
    private imageTemplate;
    private boughtIconTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-onramp-activity-item': W3mOnRampActivityItem;
    }
}
