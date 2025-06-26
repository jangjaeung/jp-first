import { IoClose } from 'react-icons/io5'
import {
    PiAddressBook,
    PiArrowCounterClockwise,
    PiArrowRight,
    PiArrowsClockwiseLight,
    PiArrowSquareOutLight,
    PiCalendarBlankDuotone,
    PiCaretDown,
    PiCaretUp,
    PiCheckCircle,
    PiCheckCircleFill,
    PiCloudArrowDown,
    PiCopySimpleDuotone,
    PiDownloadSimple,
    PiEye,
    PiEyeClosed,
    PiEyeSlash,
    PiFileText,
    PiFileTextDuotone,
    PiFilmStripDuotone,
    PiFloppyDiskLight,
    PiLinkDuotone,
    PiMagnifyingGlassLight,
    PiMinus,
    PiMonitorDuotone,
    PiNotePencilLight,
    PiPauseDuotone,
    PiPlayDuotone,
    PiPlus,
    PiPower,
    PiQuestionDuotone,
    PiRecordDuotone,
    PiScissorsDuotone,
    PiStopDuotone,
    PiSubtitlesDuotone,
    PiTranslateDuotone,
    PiTrash,
    PiUploadSimpleLight,
} from 'react-icons/pi'
import { TbCapture } from 'react-icons/tb'
import { buttonType } from './const'

export const ButtonIcon = (type: string) => {
    switch (type) {
        case buttonType.add:
            return <PiPlus size={15} />
        case buttonType.arrowDown:
            return <PiCaretDown size={12} />
        case buttonType.arrowRight:
            return <PiArrowRight />
        case buttonType.arrowUp:
            return <PiCaretUp size={12} />
        case buttonType.translate:
            return <PiTranslateDuotone />
        case buttonType.calendar:
            return <PiCalendarBlankDuotone />
        case buttonType.capture:
            return <TbCapture />
        case buttonType.check:
            return <PiCheckCircleFill />
        case buttonType.checkCircle:
            return <PiCheckCircle />
        case buttonType.close:
            return <IoClose />
        case buttonType.cloudDown:
            return <PiCloudArrowDown />
        case buttonType.copy:
            return <PiCopySimpleDuotone />
        case buttonType.delete:
            return <PiTrash />
        case buttonType.download:
            return <PiDownloadSimple />
        case buttonType.edit:
            return <PiNotePencilLight />
        case buttonType.eye:
            return <PiEye size={17} />
        case buttonType.eyeClosed:
            return <PiEyeClosed size={17} />
        case buttonType.eyeSlash:
            return <PiEyeSlash size={17} />
        case buttonType.fileText:
            return <PiFileText />
        case buttonType.film:
            return <PiFilmStripDuotone size={17} />
        case buttonType.help:
            return <PiQuestionDuotone />
        case buttonType.link:
            return <PiArrowSquareOutLight />
        case buttonType.minus:
            return <PiMinus />
        case buttonType.monitoring:
            return <PiMonitorDuotone size={15} />
        case buttonType.pause:
            return <PiPauseDuotone />
        case buttonType.power:
            return <PiPower />
        case buttonType.rec:
            return <PiRecordDuotone />
        case buttonType.reset:
            return <PiArrowCounterClockwise />
        case buttonType.resetPassword:
            return <PiArrowsClockwiseLight />
        case buttonType.save:
            return <PiFloppyDiskLight />
        case buttonType.search:
            return <PiMagnifyingGlassLight />
        case buttonType.scissor:
            return <PiScissorsDuotone />
        case buttonType.start:
            return <PiPlayDuotone />
        case buttonType.stop:
            return <PiStopDuotone />
        case buttonType.subtitle:
            return <PiSubtitlesDuotone />
        case buttonType.text:
            return <PiFileTextDuotone />
        case buttonType.upload:
            return <PiUploadSimpleLight size={17} />
        case buttonType.url:
            return <PiLinkDuotone />
        default:
            return <PiAddressBook />
    }
}
