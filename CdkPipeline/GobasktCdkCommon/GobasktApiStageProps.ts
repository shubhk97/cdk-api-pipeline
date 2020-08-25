import { StageProps } from "@aws-cdk/core";
import { gobasktProps } from "./GobasktTemplateTypes";


export interface GobasktApiStageProps extends StageProps {
    applicationProps: gobasktProps;

}
