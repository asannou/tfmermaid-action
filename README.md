# tfmermaid-action

This Github Action converts your output of [Terraform graph](https://www.terraform.io/cli/commands/graph) to [Mermaid's syntax](https://mermaid-js.github.io/mermaid/).

## Usage

See [action.yml](action.yml)

### .github/workflows/tfmermaid.yml

Convert the output of `terraform graph` to Mermaid's syntax and embed it in the `README.md` file.

```yaml
- uses: actions/checkout@v3
- uses: asannou/tfmermaid-action@master
  with:
    file: README.md
- name: commit
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add README.md
    git commit -m "generated"
    git push
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
```

### [terraform-provider-aws/examples/ecs-alb](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/ecs-alb)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    exclude: var,output
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/ecs-alb
```

### [terraform-provider-aws/examples/events/kinesis](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/events/kinesis)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    orientation: RL
    arrow-direction: forward
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/events/kinesis
```

### [terraform-provider-aws/examples/lambda-file-systems](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/lambda-file-systems)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    exclude: var
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/lambda-file-systems
```

### [terraform-provider-aws/examples/networking](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/networking)

```mermaid
%%tfmermaid:terraform-provider-aws/examples/networking
```

### [terraform-provider-aws/examples/rds](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/rds)

```mermaid
%%tfmermaid:terraform-provider-aws/examples/rds
```

### [terraform-provider-aws/examples/s3-api-gateway-integration](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/s3-api-gateway-integration)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    exclude: var
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/s3-api-gateway-integration
```

### [terraform-provider-aws/examples/s3-cross-account-access](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/s3-cross-account-access)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/s3-cross-account-access
```

### [terraform-provider-aws/examples/sagemaker](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/sagemaker)

```mermaid
%%tfmermaid:terraform-provider-aws/examples/sagemaker
```

### [terraform-provider-aws/examples/transit-gateway-cross-account-peering-attachment](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/transit-gateway-cross-account-peering-attachment)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/transit-gateway-cross-account-peering-attachment
```

### [terraform-provider-aws/examples/workspaces](https://github.com/hashicorp/terraform-provider-aws/tree/main/examples/workspaces)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    exclude: var
```

```mermaid
%%tfmermaid:terraform-provider-aws/examples/workspaces
```

### [terraform-provider-google/examples/cloud-armor](https://github.com/hashicorp/terraform-provider-google/tree/main/examples/cloud-armor)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-google/examples/cloud-armor
```

### [terraform-provider-google/examples/content-based-load-balancing](https://github.com/hashicorp/terraform-provider-google/tree/main/examples/content-based-load-balancing)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    orientation: TB
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-google/examples/content-based-load-balancing
```

### [terraform-provider-google/examples/endpoints-on-compute-engine](https://github.com/hashicorp/terraform-provider-google/tree/main/examples/endpoints-on-compute-engine)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    include: provider
```

```mermaid
%%tfmermaid:terraform-provider-google/examples/endpoints-on-compute-engine
```

### [terraform-provider-azurerm/examples/api-management](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples/api-management)

```yaml
- uses: asannou/tfmermaid-action@master
  with:
    orientation: TB
```

```mermaid
%%tfmermaid:terraform-provider-azurerm/examples/api-management
```

### [terraform-provider-azurerm/examples/recovery-services/virtual-machine](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples/recovery-services/virtual-machine)

```mermaid
%%tfmermaid:terraform-provider-azurerm/examples/recovery-services/virtual-machine
```

### [terraform-provider-azurerm/examples/traffic-manager/vm-scale-set](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples/traffic-manager/vm-scale-set)

```mermaid
%%tfmermaid:terraform-provider-azurerm/examples/traffic-manager/vm-scale-set
```

