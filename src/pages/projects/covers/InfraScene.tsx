import type { ComponentType } from "react";
import BlueGreen from "./infra/BlueGreen";
import Pipeline from "./infra/Pipeline";
import type { TintProps } from "./infra/tokens";

/*
 * AWS container deploy family; each variant moves a different mechanism.
 * default  -- Blue Green AWS Terraform: CodeDeploy blue/green behind one ALB,
 *             test listener probe, canary, listener switch, old tasks drain.
 * pipeline -- AWS DevOps Infrastructure: the GitHub Actions job graph, then
 *             docker push to ECR and a rolling ECS force-new-deployment.
 */

const VARIANTS: Record<string, ComponentType<TintProps>> = {
   default: BlueGreen,
   pipeline: Pipeline,
};

interface InfraSceneProps extends TintProps {
   variant?: string;
}

const InfraScene = ({ tint, variant = "default" }: InfraSceneProps) => {
   const Body = VARIANTS[variant] ?? BlueGreen;
   return <Body tint={tint} />;
};

export default InfraScene;
