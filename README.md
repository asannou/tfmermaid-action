# tfmermaid-action

This Github Action converts your output of [Terraform graph](https://www.terraform.io/cli/commands/graph) to [Mermaid's syntax](https://mermaid-js.github.io/mermaid/).

## Usage

See [action.yml](action.yml)

### .github/workflows/tfmermaid.yml

Convert the output of `terraform graph` to Mermaid's syntax and embed it in the `README.md` file.

```yaml
- uses: actions/checkout@v3
- uses: asannou/tfmermaid-action@v1
  with:
    file: README.md
- name: commit
  run: |
    git add README.md
    if ! git diff --cached --quiet --exit-code
    then
      git config user.name "github-actions[bot]"
      git config user.email "github-actions[bot]@users.noreply.github.com"
      git commit -m "generated"
      git push
    fi
```

### README.md

The converted output is embedded inside the mermaid code block commented `%%tfmermaid`.

~~~
```mermaid
%%tfmermaid
```
~~~

## Examples

### [terraform-provider-aws/examples/two-tier](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/two-tier)

#### Before

![terraform graph](graph.svg)

#### After

```mermaid
%%tfmermaid:terraform-provider-aws/examples/two-tier
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["ELB Classic"]
n1["aws_elb.web"]:::r
end
class n0 cs
subgraph "n2"["EC2 (Elastic Compute Cloud)"]
n3["aws_instance.web"]:::r
n4["aws_key_pair.auth"]:::r
end
class n2 cs
subgraph "n5"["VPC (Virtual Private Cloud)"]
n6["aws_internet_gateway.default"]:::r
n7["aws_route.internet_access"]:::r
n8["aws_security_group.default"]:::r
n9["aws_security_group.elb"]:::r
na["aws_subnet.default"]:::r
nb["aws_vpc.default"]:::r
end
class n5 cs
subgraph "nc"["Input Variables"]
nd(["var.aws_amis"]):::v
ne(["var.aws_region"]):::v
nf(["var.key_name"]):::v
ng(["var.public_key_path"]):::v
end
class nc vs
subgraph "nh"["Output Values"]
ni(["output.address"]):::v
end
class nh vs
n3-->n1
n9-->n1
n4-->n3
n8-->n3
na-->n3
nd--->n3
nb-->n6
nf--->n4
ng--->n4
n6-->n7
nb-->n8
nb-->n9
nb-->na
n1--->ni
```

### [terraform-provider-aws/examples/ecs-alb](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/ecs-alb)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    exclude: var,output
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/ecs-alb
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["ELB (Elastic Load Balancing)"]
n1["aws_alb.main"]:::r
n2["aws_alb_listener.front_end"]:::r
n3["aws_alb_target_group.test"]:::r
end
class n0 cs
subgraph "n4"["Auto Scaling"]
n5["aws_autoscaling_group.app"]:::r
n6["aws_launch_configuration.app"]:::r
end
class n4 cs
subgraph "n7"["CloudWatch Logs"]
n8["aws_cloudwatch_log_group.app"]:::r
n9["aws_cloudwatch_log_group.ecs"]:::r
end
class n7 cs
subgraph "na"["ECS (Elastic Container)"]
nb["aws_ecs_cluster.main"]:::r
nc["aws_ecs_service.test"]:::r
nd["aws_ecs_task_definition.ghost"]:::r
end
class na cs
subgraph "ne"["IAM (Identity & Access Management)"]
nf["aws_iam_instance_profile.app"]:::r
ng["aws_iam_role.app_instance"]:::r
nh["aws_iam_role.ecs_service"]:::r
ni["aws_iam_role_policy.<br/>ecs_service"]:::r
nj["aws_iam_role_policy.instance"]:::r
end
class ne cs
subgraph "nk"["VPC (Virtual Private Cloud)"]
nl["aws_internet_gateway.gw"]:::r
nm["aws_route_table.r"]:::r
nn["aws_route_table_association.a"]:::r
no["aws_security_group.<br/>instance_sg"]:::r
np["aws_security_group.lb_sg"]:::r
nq["aws_subnet.main"]:::r
nr["aws_vpc.main"]:::r
end
class nk cs
subgraph "ns"["EC2 (Elastic Compute Cloud)"]
nt{{"data.<br/>aws_availability_zones.<br/>available"}}:::r
end
class ns cs
subgraph "nu"["Meta Data Sources"]
nv{{"data.aws_region.current"}}:::r
end
class nu cs
subgraph "nw"["SSM (Systems Manager)"]
nx{{"data.<br/>aws_ssm_parameter.<br/>ecs_image_id"}}:::r
end
class nw cs
np-->n1
nq-->n1
n1-->n2
n3-->n2
nr-->n3
n6-->n5
nq-->n5
n2-->nc
nb-->nc
nd-->nc
ni-->nc
n8-->nd
nv-->nd
ng-->nf
nh-->ni
n8-->nj
n9-->nj
ng-->nj
nr-->nl
n9-->n6
nb-->n6
nf-->n6
no-->n6
nv-->n6
nx-->n6
nl-->nm
nm-->nn
nq-->nn
np-->no
nr-->np
nr-->nq
nt-->nq
```

### [terraform-provider-aws/examples/events/kinesis](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/events/kinesis)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    orientation: RL
    arrow-direction: forward
    exclude: _orphan
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/events/kinesis
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart RL
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["EventBridge"]
n1["aws_cloudwatch_event_rule.foo"]:::r
n2["aws_cloudwatch_event_target.<br/>foobar"]:::r
end
class n0 cs
subgraph "n3"["IAM (Identity & Access Management)"]
n4["aws_iam_role.role"]:::r
n5["aws_iam_role_policy.policy"]:::r
end
class n3 cs
subgraph "n6"["Input Variables"]
n7(["var.rule_name"]):::v
n8(["var.target_name"]):::v
n9(["var.iam_role_name"]):::v
na(["var.stream_name"]):::v
end
class n6 vs
subgraph "nb"["Kinesis"]
nc["aws_kinesis_stream.foo"]:::r
end
class nb cs
subgraph "nd"["Output Values"]
ne(["output.kinesis_stream_arn"]):::v
nf(["output.rule_arn"]):::v
end
class nd vs
n1-->n4
n1--->n7
n2-->n1
n2-->nc
n2--->n8
n4--->n9
n5-->n4
nc--->na
ne--->nc
nf--->n1
```

### [terraform-provider-aws/examples/lambda-file-systems](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/lambda-file-systems)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    exclude: _orphan
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/lambda-file-systems
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["VPC (Virtual Private Cloud)"]
n1["aws_default_security_group.<br/>default"]:::r
n2["aws_default_vpc.default"]:::r
n3["aws_default_subnet.<br/>default_az1"]:::r
n4["aws_default_subnet.<br/>default_az2"]:::r
end
class n0 cs
subgraph "n5"["EC2 (Elastic Compute Cloud)"]
n6{{"data.<br/>aws_availability_zones.<br/>available"}}:::r
end
class n5 cs
subgraph "n7"["EFS (Elastic File System)"]
n8["aws_efs_access_point.<br/>access_point_lambda"]:::r
n9["aws_efs_file_system.<br/>efs_for_lambda"]:::r
na["aws_efs_mount_target.<br/>mount_target_az1"]:::r
nb["aws_efs_mount_target.<br/>mount_target_az2"]:::r
end
class n7 cs
subgraph "nc"["IAM (Identity & Access Management)"]
nd["aws_iam_role.<br/>iam_role_for_lambda"]:::r
ne{{"data.<br/>aws_iam_policy_document.<br/>assume_role_policy"}}:::r
nf["aws_iam_role_policy_attachment.<br/>AWSLambdaVPCAccessExecutionRole-attach"]:::r
ng{{"data.<br/>aws_iam_policy.<br/>AWSLambdaVPCAccessExecutionRole"}}:::r
nh["aws_iam_role_policy_attachment.<br/>AmazonElasticFileSystemClientFullAccess-attach"]:::r
ni{{"data.<br/>aws_iam_policy.<br/>AmazonElasticFileSystemClientFullAccess"}}:::r
end
class nc cs
subgraph "nj"["Lambda"]
nk["aws_lambda_function.<br/>example_lambda"]:::r
end
class nj cs
nl{{"data.archive_file.zip"}}:::r
subgraph "nm"["Meta Data Sources"]
nn{{"data.aws_partition.current"}}:::r
end
class nm cs
subgraph "no"["Output Values"]
np(["output.lambda"]):::v
end
class no vs
n2-->n1
n6-->n3
n6-->n4
n9-->n8
n1-->na
n3-->na
n9-->na
n1-->nb
n4-->nb
n9-->nb
ne-->nd
nd-->nf
ng-->nf
nd-->nh
ni-->nh
n8-->nk
na-->nk
nb-->nk
nd-->nk
nl-->nk
nn-->ng
nn-->ni
nk--->np
```

### [terraform-provider-aws/examples/networking](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/networking)

```mermaid
%%tfmermaid:terraform-provider-aws/examples/networking
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["module.us-east-1"]
subgraph "n0_padding"[" "]
subgraph "n1"["VPC (Virtual Private Cloud)"]
n2["aws_internet_gateway.main"]:::r
n3["aws_security_group.<br/>internal-all"]:::r
n4["aws_security_group.region"]:::r
n5["aws_vpc.main"]:::r
end
class n1 cs
subgraph "n6"["EC2 (Elastic Compute Cloud)"]
n7{{"data.<br/>aws_availability_zones.<br/>all"}}:::r
end
class n6 cs
subgraph "n8"["module.primary_subnet"]
subgraph "n8_padding"[" "]
subgraph "n9"["VPC (Virtual Private Cloud)"]
na["aws_route_table.main"]:::r
nb["aws_route_table_association.<br/>main"]:::r
nc["aws_security_group.az"]:::r
nd["aws_subnet.main"]:::r
ne{{"data.aws_vpc.target"}}:::r
end
class n9 cs
subgraph "nf"["EC2 (Elastic Compute Cloud)"]
ng{{"data.<br/>aws_availability_zone.<br/>target"}}:::r
end
class nf cs
subgraph "nh"["Input Variables"]
ni(["var.vpc_id"]):::v
nj(["var.az_numbers"]):::v
nk(["var.availability_zone"]):::v
end
class nh vs
subgraph "nl"["Output Values"]
nm(["output.subnet_id"]):::v
end
class nl vs
end
class n8_padding ps
end
class n8 ms
subgraph "nn"["module.secondary_subnet"]
subgraph "nn_padding"[" "]
subgraph "no"["VPC (Virtual Private Cloud)"]
np["aws_route_table.main"]:::r
nq["aws_route_table_association.<br/>main"]:::r
nr["aws_security_group.az"]:::r
ns["aws_subnet.main"]:::r
nt{{"data.aws_vpc.target"}}:::r
end
class no cs
subgraph "nu"["EC2 (Elastic Compute Cloud)"]
nv{{"data.<br/>aws_availability_zone.<br/>target"}}:::r
end
class nu cs
subgraph "nw"["Input Variables"]
nx(["var.vpc_id"]):::v
ny(["var.az_numbers"]):::v
nz(["var.availability_zone"]):::v
end
class nw vs
subgraph "n10"["Output Values"]
n11(["output.subnet_id"]):::v
end
class n10 vs
end
class nn_padding ps
end
class nn ms
subgraph "n12"["Input Variables"]
n13(["var.base_cidr_block"]):::v
n14(["var.region_numbers"]):::v
n15(["var.region"]):::v
end
class n12 vs
subgraph "n16"["Output Values"]
n17(["output.primary_subnet_id"]):::v
n18(["output.secondary_subnet_id"]):::v
n19(["output.vpc_id"]):::v
end
class n16 vs
end
class n0_padding ps
end
class n0 ms
subgraph "n1a"["module.us-west-2"]
subgraph "n1a_padding"[" "]
subgraph "n1b"["VPC (Virtual Private Cloud)"]
n1c["aws_internet_gateway.main"]:::r
n1d["aws_security_group.<br/>internal-all"]:::r
n1e["aws_security_group.region"]:::r
n1f["aws_vpc.main"]:::r
end
class n1b cs
subgraph "n1g"["EC2 (Elastic Compute Cloud)"]
n1h{{"data.<br/>aws_availability_zones.<br/>all"}}:::r
end
class n1g cs
subgraph "n1i"["module.primary_subnet"]
subgraph "n1i_padding"[" "]
subgraph "n1j"["VPC (Virtual Private Cloud)"]
n1k["aws_route_table.main"]:::r
n1l["aws_route_table_association.<br/>main"]:::r
n1m["aws_security_group.az"]:::r
n1n["aws_subnet.main"]:::r
n1o{{"data.aws_vpc.target"}}:::r
end
class n1j cs
subgraph "n1p"["EC2 (Elastic Compute Cloud)"]
n1q{{"data.<br/>aws_availability_zone.<br/>target"}}:::r
end
class n1p cs
subgraph "n1r"["Input Variables"]
n1s(["var.vpc_id"]):::v
n1t(["var.az_numbers"]):::v
n1u(["var.availability_zone"]):::v
end
class n1r vs
subgraph "n1v"["Output Values"]
n1w(["output.subnet_id"]):::v
end
class n1v vs
end
class n1i_padding ps
end
class n1i ms
subgraph "n1x"["module.secondary_subnet"]
subgraph "n1x_padding"[" "]
subgraph "n1y"["VPC (Virtual Private Cloud)"]
n1z["aws_route_table.main"]:::r
n20["aws_route_table_association.<br/>main"]:::r
n21["aws_security_group.az"]:::r
n22["aws_subnet.main"]:::r
n23{{"data.aws_vpc.target"}}:::r
end
class n1y cs
subgraph "n24"["EC2 (Elastic Compute Cloud)"]
n25{{"data.<br/>aws_availability_zone.<br/>target"}}:::r
end
class n24 cs
subgraph "n26"["Input Variables"]
n27(["var.vpc_id"]):::v
n28(["var.az_numbers"]):::v
n29(["var.availability_zone"]):::v
end
class n26 vs
subgraph "n2a"["Output Values"]
n2b(["output.subnet_id"]):::v
end
class n2a vs
end
class n1x_padding ps
end
class n1x ms
subgraph "n2c"["Input Variables"]
n2d(["var.base_cidr_block"]):::v
n2e(["var.region_numbers"]):::v
n2f(["var.region"]):::v
end
class n2c vs
subgraph "n2g"["Output Values"]
n2h(["output.primary_subnet_id"]):::v
n2i(["output.secondary_subnet_id"]):::v
n2j(["output.vpc_id"]):::v
end
class n2g vs
end
class n1a_padding ps
end
class n1a ms
subgraph "n2k"["Input Variables"]
n2l(["var.base_cidr_block"]):::v
end
class n2k vs
n5-->n2
n5-->n3
n5-->n4
n13-->n5
n14-->n5
ni-->na
na-->nb
nd-->nb
nd-->nc
ng-->nd
ne-->nd
nj-->nd
nk-->ng
ni-->ne
nd-->nm
n7-->nk
n5-->ni
nx-->np
np-->nq
ns-->nq
ns-->nr
nv-->ns
nt-->ns
ny-->ns
nz-->nv
nx-->nt
ns-->n11
n7-->nz
n5-->nx
nm-->n17
n11-->n18
n5-->n19
n2l--->n13
n1f-->n1c
n1f-->n1d
n1f-->n1e
n2d-->n1f
n2e-->n1f
n1s-->n1k
n1k-->n1l
n1n-->n1l
n1n-->n1m
n1q-->n1n
n1o-->n1n
n1t-->n1n
n1u-->n1q
n1s-->n1o
n1n-->n1w
n1h-->n1u
n1f-->n1s
n27-->n1z
n1z-->n20
n22-->n20
n22-->n21
n25-->n22
n23-->n22
n28-->n22
n29-->n25
n27-->n23
n22-->n2b
n1h-->n29
n1f-->n27
n1w-->n2h
n2b-->n2i
n1f-->n2j
n2l--->n2d
```

### [terraform-provider-aws/examples/rds](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/rds)

```mermaid
%%tfmermaid:terraform-provider-aws/examples/rds
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["RDS (Relational Database)"]
n1["aws_db_instance.default"]:::r
n2["aws_db_subnet_group.default"]:::r
end
class n0 cs
subgraph "n3"["VPC (Virtual Private Cloud)"]
n4["aws_security_group.default"]:::r
n5["aws_subnet.subnet_1"]:::r
n6["aws_subnet.subnet_2"]:::r
end
class n3 cs
subgraph "n7"["Input Variables"]
n8(["var.aws_region"]):::v
n9(["var.az_1"]):::v
na(["var.az_2"]):::v
nb(["var.cidr_blocks"]):::v
nc(["var.db_name"]):::v
nd(["var.engine"]):::v
ne(["var.engine_version"]):::v
nf(["var.identifier"]):::v
ng(["var.instance_class"]):::v
nh(["var.password"]):::v
ni(["var.sg_name"]):::v
nj(["var.storage"]):::v
nk(["var.subnet_1_cidr"]):::v
nl(["var.subnet_2_cidr"]):::v
nm(["var.username"]):::v
nn(["var.vpc_id"]):::v
end
class n7 vs
subgraph "no"["Output Values"]
np(["output.db_instance_address"]):::v
nq(["output.db_instance_id"]):::v
nr(["output.subnet_group"]):::v
end
class no vs
n2-->n1
n4-->n1
nc--->n1
nd--->n1
ne--->n1
nf--->n1
ng--->n1
nh--->n1
nj--->n1
nm--->n1
n5-->n2
n6-->n2
nb--->n4
ni--->n4
nn--->n4
n9--->n5
nk--->n5
nn--->n5
na--->n6
nl--->n6
nn--->n6
n1--->np
n1--->nq
n2--->nr
```

### [terraform-provider-aws/examples/s3-api-gateway-integration](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/s3-api-gateway-integration)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    exclude: _orphan
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/s3-api-gateway-integration
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["API Gateway"]
n1["aws_api_gateway_deployment.<br/>S3APIDeployment"]:::r
n2["aws_api_gateway_integration.<br/>S3Integration"]:::r
n3["aws_api_gateway_method.<br/>GetBuckets"]:::r
n4["aws_api_gateway_integration_response.<br/>IntegrationResponse200"]:::r
n5["aws_api_gateway_method_response.<br/>Status200"]:::r
n6["aws_api_gateway_integration_response.<br/>IntegrationResponse400"]:::r
n7["aws_api_gateway_method_response.<br/>Status400"]:::r
n8["aws_api_gateway_integration_response.<br/>IntegrationResponse500"]:::r
n9["aws_api_gateway_method_response.<br/>Status500"]:::r
na["aws_api_gateway_rest_api.MyS3"]:::r
nb["aws_api_gateway_resource.<br/>Folder"]:::r
nc["aws_api_gateway_resource.Item"]:::r
end
class n0 cs
subgraph "nd"["IAM (Identity & Access Management)"]
ne["aws_iam_role.<br/>s3_api_gateway_role"]:::r
nf["aws_iam_policy.s3_policy"]:::r
ng["aws_iam_role_policy_attachment.<br/>s3_policy_attach"]:::r
end
class nd cs
n2-->n1
n3-->n2
ne-->n2
n2-->n4
n5-->n4
n7-->n6
n9-->n8
na-->n3
n3-->n5
n2-->n7
n2-->n9
na-->nb
nb-->nc
nf-->ng
ne-->ng
```

### [terraform-provider-aws/examples/s3-cross-account-access](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/s3-cross-account-access)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/s3-cross-account-access
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["S3 (Simple Storage)"]
n1["aws_s3_bucket.prod"]:::r
n2["aws_s3_bucket_acl.<br/>prod_bucket_acl"]:::r
n3["aws_s3_bucket_policy.<br/>prod_bucket_policy"]:::r
n4["aws_s3_object.prod"]:::r
n5["aws_s3_object.test"]:::r
end
class n0 cs
n6[/"provider<br/>[&quot;registry.terraform.io/hashicorp/aws&quot;]"\]
n7[/"provider<br/>[&quot;registry.terraform.io/hashicorp/aws&quot;].<br/>prod"\]
n8[/"provider<br/>[&quot;registry.terraform.io/hashicorp/aws&quot;].<br/>test"\]
subgraph "n9"["Input Variables"]
na(["var.bucket_name"]):::v
nb(["var.prod_access_key"]):::v
nc(["var.prod_secret_key"]):::v
nd(["var.test_access_key"]):::v
ne(["var.test_account_id"]):::v
nf(["var.test_secret_key"]):::v
end
class n9 vs
n7-->n1
na--->n1
n1-->n2
n6-->n2
n1-->n3
n6-->n3
ne--->n3
n3-->n4
n3-->n5
n8-->n5
n2-->n6
n3-->n6
n4-->n7
nb--->n7
nc--->n7
n5-->n8
nd--->n8
nf--->n8
```

### [terraform-provider-aws/examples/sagemaker](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/sagemaker)

```mermaid
%%tfmermaid:terraform-provider-aws/examples/sagemaker
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["IAM (Identity & Access Management)"]
n1["aws_iam_policy.foo"]:::r
n2["aws_iam_role.foo"]:::r
n3["aws_iam_role_policy_attachment.<br/>foo"]:::r
n4{{"data.<br/>aws_iam_policy_document.<br/>assume_role"}}:::r
n5{{"data.<br/>aws_iam_policy_document.<br/>foo"}}:::r
end
class n0 cs
subgraph "n6"["S3 (Simple Storage)"]
n7["aws_s3_bucket.foo"]:::r
n8["aws_s3_bucket_acl.<br/>foo_bucket_acl"]:::r
n9["aws_s3_object.object"]:::r
end
class n6 cs
subgraph "na"["SageMaker"]
nb["aws_sagemaker_endpoint.foo"]:::r
nc["aws_sagemaker_endpoint_configuration.<br/>foo"]:::r
nd["aws_sagemaker_model.foo"]:::r
end
class na cs
subgraph "ne"["STS (Security Token)"]
nf{{"data.<br/>aws_caller_identity.<br/>current"}}:::r
end
class ne cs
subgraph "ng"["Meta Data Sources"]
nh{{"data.aws_region.current"}}:::r
end
class ng cs
ni["random_integer.bucket_suffix"]:::r
n5-->n1
n4-->n2
n1-->n3
n2-->n3
ni-->n7
n7-->n8
n7-->n9
nc-->nb
nd-->nc
n2-->nd
n7-->nd
nf-->nd
nh-->nd
n7-->n5
```

### [terraform-provider-aws/examples/transit-gateway-cross-account-peering-attachment](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/transit-gateway-cross-account-peering-attachment)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/transit-gateway-cross-account-peering-attachment
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Transit Gateway"]
n1["aws_ec2_transit_gateway.first"]:::r
n2["aws_ec2_transit_gateway.<br/>second"]:::r
n3["aws_ec2_transit_gateway_peering_attachment.<br/>example"]:::r
n4["aws_ec2_transit_gateway_peering_attachment_accepter.<br/>example"]:::r
n5{{"data.<br/>aws_ec2_transit_gateway_peering_attachment.<br/>example"}}:::r
end
class n0 cs
subgraph "n6"["STS (Security Token)"]
n7{{"data.<br/>aws_caller_identity.<br/>first"}}:::r
end
class n6 cs
n8[/"provider<br/>[&quot;registry.terraform.io/hashicorp/aws&quot;].<br/>first"\]
n9[/"provider<br/>[&quot;registry.terraform.io/hashicorp/aws&quot;].<br/>second"\]
subgraph "na"["Input Variables"]
nb(["var.aws_first_access_key"]):::v
nc(["var.aws_first_region"]):::v
nd(["var.aws_first_secret_key"]):::v
ne(["var.aws_second_access_key"]):::v
nf(["var.aws_second_region"]):::v
ng(["var.aws_second_secret_key"]):::v
end
class na vs
n8-->n1
n9-->n2
n1-->n3
n2-->n3
n7-->n3
n5-->n4
n8-->n7
n3-->n5
n4-->n8
nb--->n8
nc--->n8
nd--->n8
n3-->n9
ne--->n9
nf--->n9
ng--->n9
```

### [terraform-provider-aws/examples/workspaces](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/workspaces)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    exclude: _orphan
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/workspaces
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Directory Service"]
n1["aws_directory_service_directory.<br/>example"]:::r
end
class n0 cs
subgraph "n2"["VPC (Virtual Private Cloud)"]
n3["aws_subnet.private-a"]:::r
n4["aws_subnet.private-b"]:::r
n5["aws_vpc.main"]:::r
end
class n2 cs
subgraph "n6"["KMS (Key Management)"]
n7["aws_kms_key.example"]:::r
end
class n6 cs
n8(["local.workspaces_az_ids"]):::v
subgraph "n9"["WorkSpaces"]
na["aws_workspaces_directory.<br/>example"]:::r
nb["aws_workspaces_ip_group.main"]:::r
nc["aws_workspaces_workspace.<br/>example"]:::r
nd{{"data.<br/>aws_workspaces_bundle.<br/>value_windows"}}:::r
end
class n9 cs
subgraph "ne"["EC2 (Elastic Compute Cloud)"]
nf{{"data.<br/>aws_availability_zones.<br/>available"}}:::r
end
class ne cs
subgraph "ng"["Meta Data Sources"]
nh{{"data.aws_region.current"}}:::r
end
class ng cs
ni(["local.<br/>workspaces_az_id_strings"]):::v
nj(["local.<br/>region_workspaces_az_id_strings"]):::v
n3-->n1
n4-->n1
n5-->n3
n8-->n3
n5-->n4
n8-->n4
n1-->na
n7-->nc
na-->nc
nd-->nc
nf-->ni
nh-->ni
nj-->ni
ni-->n8
```

### [terraform-provider-google/examples/cloud-armor](https://github.com/hashicorp/terraform-provider-google/tree/main/examples/cloud-armor)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-google/examples/cloud-armor
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Compute Engine"]
n1["google_compute_backend_service.<br/>website"]:::r
n2["google_compute_firewall.<br/>cluster1"]:::r
n3["google_compute_global_forwarding_rule.<br/>default"]:::r
n4["google_compute_http_health_check.<br/>health"]:::r
n5["google_compute_instance.<br/>cluster1"]:::r
n6["google_compute_instance_group.<br/>webservers"]:::r
n7["google_compute_security_policy.<br/>security-policy-1"]:::r
n8["google_compute_target_http_proxy.<br/>default"]:::r
n9["google_compute_target_pool.<br/>example"]:::r
na["google_compute_url_map.<br/>default"]:::r
end
class n0 cs
nb[/"provider<br/>[&quot;registry.terraform.io/hashicorp/google&quot;]"\]
nc[/"provider<br/>[&quot;registry.terraform.io/hashicorp/random&quot;]"\]
nd["random_id.instance_id"]:::r
subgraph "ne"["Input Variables"]
nf(["var.credentials_file_path"]):::v
ng(["var.ip_white_list"]):::v
nh(["var.project_name"]):::v
ni(["var.region"]):::v
nj(["var.region_zone"]):::v
end
class ne vs
subgraph "nk"["Output Values"]
nl(["output.ip"]):::v
end
class nk vs
n4-->n1
n6-->n1
n7-->n1
nb-->n2
n8-->n3
nb-->n4
nb-->n5
nd-->n5
n5-->n6
nb-->n7
ng--->n7
na-->n8
n4-->n9
n5-->n9
n1-->na
n3--->nl
n2-->nb
n3-->nb
n9-->nb
nf--->nb
nh--->nb
ni--->nb
nj--->nb
nd-->nc
nc-->nd
```

### [terraform-provider-google/examples/content-based-load-balancing](https://github.com/hashicorp/terraform-provider-google/tree/main/examples/content-based-load-balancing)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    orientation: TB
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-google/examples/content-based-load-balancing
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart TB
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Compute Engine"]
n1["google_compute_backend_service.<br/>video-service"]:::r
n2["google_compute_backend_service.<br/>www-service"]:::r
n3["google_compute_firewall.<br/>default"]:::r
n4["google_compute_global_address.<br/>external-address"]:::r
n5["google_compute_global_forwarding_rule.<br/>default"]:::r
n6["google_compute_health_check.<br/>health-check"]:::r
n7["google_compute_instance.www"]:::r
n8["google_compute_instance.<br/>www-video"]:::r
n9["google_compute_instance_group.<br/>video-resources"]:::r
na["google_compute_instance_group.<br/>www-resources"]:::r
nb["google_compute_target_http_proxy.<br/>http-lb-proxy"]:::r
nc["google_compute_url_map.<br/>web-map"]:::r
end
class n0 cs
nd[/"provider<br/>[&quot;registry.terraform.io/hashicorp/google&quot;]"\]
subgraph "ne"["Input Variables"]
nf(["var.credentials_file_path"]):::v
ng(["var.project_name"]):::v
nh(["var.region"]):::v
ni(["var.region_zone"]):::v
end
class ne vs
subgraph "nj"["Output Values"]
nk(["output.application_public_ip"]):::v
end
class nj vs
n6-->n1
n9-->n1
n6-->n2
na-->n2
nd-->n3
nd-->n4
n4-->n5
nb-->n5
nd-->n6
nd-->n7
nd-->n8
n8-->n9
n7-->na
nc-->nb
n1-->nc
n2-->nc
n5--->nk
n3-->nd
n5-->nd
nf--->nd
ng--->nd
nh--->nd
ni--->nd
```

### [terraform-provider-google/examples/endpoints-on-compute-engine](https://github.com/hashicorp/terraform-provider-google/tree/main/examples/endpoints-on-compute-engine)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-google/examples/endpoints-on-compute-engine
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Compute Engine"]
n1["google_compute_firewall.<br/>network"]:::r
n2["google_compute_instance.<br/>project_1_vm"]:::r
n3["google_compute_network.<br/>network"]:::r
end
class n0 cs
subgraph "n4"["Cloud Endpoints"]
n5["google_endpoints_service.<br/>endpoints_service"]:::r
end
class n4 cs
subgraph "n6"["Cloud Platform"]
n7["google_project.<br/>endpoints_project"]:::r
n8["google_project_service.<br/>endpoints_project"]:::r
n9["google_project_service.<br/>endpoints_project_sm"]:::r
end
class n6 cs
na[/"provider<br/>[&quot;registry.terraform.io/hashicorp/google&quot;]"\]
nb[/"provider<br/>[&quot;registry.terraform.io/hashicorp/random&quot;]"\]
nc["random_id.project_name"]:::r
subgraph "nd"["Input Variables"]
ne(["var.billing_account_id"]):::v
nf(["var.credentials_file_path"]):::v
ng(["var.org_id"]):::v
nh(["var.region"]):::v
ni(["var.region_zone"]):::v
end
class nd vs
subgraph "nj"["Output Values"]
nk(["output.ip"]):::v
end
class nj vs
n3-->n1
n1-->n2
n5-->n2
ni--->n2
n8-->n3
n9-->n5
na-->n7
nc-->n7
ne--->n7
ng--->n7
n7-->n8
n7-->n9
n2--->nk
n2-->na
nf--->na
nh--->na
nc-->nb
nb-->nc
```

### [terraform-provider-azurerm/examples/api-management](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples/api-management)

```yaml
- uses: asannou/tfmermaid-action@v1
  with:
    orientation: TB
```

```mermaid
%%tfmermaid:terraform-provider-azurerm/examples/api-management
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart TB
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["API Management"]
n1["azurerm_api_management.<br/>apim_service"]:::r
n2["azurerm_api_management_api.<br/>api"]:::r
n3["azurerm_api_management_group.<br/>group"]:::r
n4["azurerm_api_management_product.<br/>product"]:::r
n5["azurerm_api_management_product_api.<br/>product_api"]:::r
n6["azurerm_api_management_product_group.<br/>product_group"]:::r
end
class n0 cs
subgraph "n7"["Base"]
n8["azurerm_resource_group.rg"]:::r
end
class n7 cs
subgraph "n9"["Input Variables"]
na(["var.location"]):::v
nb(["var.<br/>open_api_spec_content_format"]):::v
nc(["var.<br/>open_api_spec_content_value"]):::v
nd(["var.prefix"]):::v
end
class n9 vs
subgraph "ne"["Output Values"]
nf(["output.api_outputs"]):::v
ng(["output.gateway_url"]):::v
nh(["output.product_api_ids"]):::v
ni(["output.product_group_ids"]):::v
nj(["output.product_ids"]):::v
nk(["output.service_id"]):::v
nl(["output.<br/>service_public_ip_addresses"]):::v
end
class ne vs
n8-->n1
n1-->n2
nb--->n2
nc--->n2
n1-->n3
n1-->n4
n2-->n5
n4-->n5
n3-->n6
n4-->n6
na--->n8
nd--->n8
n2--->nf
n1--->ng
n5--->nh
n6--->ni
n4--->nj
n1--->nk
n1--->nl
```

### [terraform-provider-azurerm/examples/recovery-services/virtual-machine](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples/recovery-services/virtual-machine)

```mermaid
%%tfmermaid:terraform-provider-azurerm/examples/recovery-services/virtual-machine
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Recovery Services"]
n1["azurerm_backup_policy_vm.<br/>example"]:::r
n2["azurerm_backup_protected_vm.<br/>example"]:::r
n3["azurerm_recovery_services_vault.<br/>example"]:::r
end
class n0 cs
subgraph "n4"["Base"]
n5["azurerm_resource_group.<br/>example"]:::r
end
class n4 cs
subgraph "n6"["module.virtual-machine"]
subgraph "n6_padding"[" "]
subgraph "n7"["Network"]
n8["azurerm_network_interface.<br/>example"]:::r
end
class n7 cs
subgraph "n9"["Compute"]
na["azurerm_virtual_machine.<br/>example"]:::r
end
class n9 cs
subgraph "nb"["Base"]
nc{{"data.<br/>azurerm_resource_group.<br/>example"}}:::r
end
class nb cs
subgraph "nd"["Output Values"]
ne(["output.id"]):::v
end
class nd vs
subgraph "nf"["Input Variables"]
ng(["var.prefix"]):::v
nh(["var.subnet_id"]):::v
ni(["var.resource_group_name"]):::v
end
class nf vs
end
class n6_padding ps
end
class n6 ms
subgraph "nj"["module.virtual-network"]
subgraph "nj_padding"[" "]
subgraph "nk"["Network"]
nl["azurerm_subnet.example"]:::r
nm["azurerm_virtual_network.<br/>example"]:::r
end
class nk cs
subgraph "nn"["Base"]
no{{"data.<br/>azurerm_resource_group.<br/>example"}}:::r
end
class nn cs
subgraph "np"["Output Values"]
nq(["output.subnet_id"]):::v
end
class np vs
subgraph "nr"["Input Variables"]
ns(["var.prefix"]):::v
nt(["var.resource_group_name"]):::v
end
class nr vs
end
class nj_padding ps
end
class nj ms
subgraph "nu"["Input Variables"]
nv(["var.location"]):::v
nw(["var.prefix"]):::v
end
class nu vs
n3-->n1
n1-->n2
ne-->n2
n5-->n3
nv--->n5
nw--->n5
nc-->n8
ng-->n8
nh-->n8
n8-->na
ni-->nc
na-->ne
nw--->ng
n5-->ni
nq-->nh
nm-->nl
no-->nm
ns-->nm
nt-->no
nl-->nq
nw--->ns
n5-->nt
```

### [terraform-provider-azurerm/examples/traffic-manager/vm-scale-set](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples/traffic-manager/vm-scale-set)

```mermaid
%%tfmermaid:terraform-provider-azurerm/examples/traffic-manager/vm-scale-set
%%{init:{"theme":"default","themeVariables":{"lineColor":"#6f7682","textColor":"#6f7682"}}}%%
flowchart LR
classDef r fill:#5c4ee5,stroke:#444,color:#fff
classDef v fill:#eeedfc,stroke:#eeedfc,color:#5c4ee5
classDef ms fill:none,stroke:#dce0e6,stroke-width:2px
classDef vs fill:none,stroke:#dce0e6,stroke-width:4px,stroke-dasharray:10
classDef ps fill:none,stroke:none
classDef cs fill:#f7f8fa,stroke:#dce0e6,stroke-width:2px
subgraph "n0"["Base"]
n1["azurerm_resource_group.<br/>example"]:::r
end
class n0 cs
subgraph "n2"["Network"]
n3["azurerm_traffic_manager_azure_endpoint.<br/>region1"]:::r
n4["azurerm_traffic_manager_azure_endpoint.<br/>region2"]:::r
n5["azurerm_traffic_manager_profile.<br/>example"]:::r
end
class n2 cs
subgraph "n6"["module.region1"]
subgraph "n6_padding"[" "]
subgraph "n7"["Load Balancer"]
n8["azurerm_lb.example"]:::r
n9["azurerm_lb_backend_address_pool.<br/>example"]:::r
na["azurerm_lb_probe.example"]:::r
nb["azurerm_lb_rule.example"]:::r
end
class n7 cs
subgraph "nc"["Network"]
nd["azurerm_public_ip.example"]:::r
ne["azurerm_subnet.example"]:::r
nf["azurerm_virtual_network.<br/>example"]:::r
end
class nc cs
subgraph "ng"["Base"]
nh["azurerm_resource_group.<br/>example"]:::r
end
class ng cs
subgraph "ni"["Compute"]
nj["azurerm_virtual_machine_scale_set.<br/>example"]:::r
end
class ni cs
subgraph "nk"["Output Values"]
nl(["output.public_ip_address_id"]):::v
end
class nk vs
nm(["local.<br/>frontend_ip_configuration_name"]):::v
subgraph "nn"["Input Variables"]
no(["var.location"]):::v
np(["var.prefix"]):::v
end
class nn vs
end
class n6_padding ps
end
class n6 ms
subgraph "nq"["module.region2"]
subgraph "nq_padding"[" "]
subgraph "nr"["Load Balancer"]
ns["azurerm_lb.example"]:::r
nt["azurerm_lb_backend_address_pool.<br/>example"]:::r
nu["azurerm_lb_probe.example"]:::r
nv["azurerm_lb_rule.example"]:::r
end
class nr cs
subgraph "nw"["Network"]
nx["azurerm_public_ip.example"]:::r
ny["azurerm_subnet.example"]:::r
nz["azurerm_virtual_network.<br/>example"]:::r
end
class nw cs
subgraph "n10"["Base"]
n11["azurerm_resource_group.<br/>example"]:::r
end
class n10 cs
subgraph "n12"["Compute"]
n13["azurerm_virtual_machine_scale_set.<br/>example"]:::r
end
class n12 cs
subgraph "n14"["Output Values"]
n15(["output.public_ip_address_id"]):::v
end
class n14 vs
n16(["local.<br/>frontend_ip_configuration_name"]):::v
subgraph "n17"["Input Variables"]
n18(["var.location"]):::v
n19(["var.prefix"]):::v
end
class n17 vs
end
class nq_padding ps
end
class nq ms
subgraph "n1a"["Input Variables"]
n1b(["var.alt_location"]):::v
n1c(["var.location"]):::v
n1d(["var.prefix"]):::v
end
class n1a vs
n1c--->n1
n1d--->n1
n5-->n3
nl-->n3
n5-->n4
n15-->n4
n1-->n5
nd-->n8
nm-->n8
n8-->n9
n8-->na
n9-->nb
na-->nb
nh-->nd
no-->nh
np-->nh
nf-->ne
n9-->nj
ne-->nj
nh-->nf
n1c--->no
n1d--->np
nx-->ns
n16-->ns
ns-->nt
ns-->nu
nt-->nv
nu-->nv
n11-->nx
n18-->n11
n19-->n11
nz-->ny
nt-->n13
ny-->n13
n11-->nz
n1b--->n18
n1d--->n19
```

