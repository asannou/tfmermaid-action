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
```

