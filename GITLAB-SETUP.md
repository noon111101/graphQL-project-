# Hướng dẫn cấu hình GitLab CI/CD Pipeline

## 📋 Yêu cầu

1. **GitLab Repository** đã được tạo
2. **GitLab Runner** đã được cài đặt và đăng ký (hoặc sử dụng Shared Runners)
3. **Private Docker Registry** (ví dụ: Harbor, DockerHub Private, GitLab Container Registry)
4. **VPS/Server** để deploy

## 🔧 Các bước cấu hình

### Bước 1: Cấu hình GitLab CI/CD Variables

Vào **Settings → CI/CD → Variables** trong GitLab repository của bạn và thêm các biến sau:

| Variable Key | Value | Protected | Masked |
|--------------|-------|-----------|--------|
| `REGISTRY_URL` | registry.aiunboxed.net (hoặc registry của bạn) | ✅ | ❌ |
| `REGISTRY_USER` | username_registry | ✅ | ❌ |
| `REGISTRY_PASS` | password_registry | ✅ | ✅ |
| `VPS_HOST` | IP hoặc domain VPS của bạn | ✅ | ❌ |
| `VPS_USER` | root hoặc user SSH | ✅ | ❌ |
| `VPS_KEY` | Private SSH Key (toàn bộ nội dung) | ✅ | ✅ |

**Lưu ý về VPS_KEY:**
- Copy toàn bộ nội dung file private key (bao gồm `-----BEGIN ... KEY-----` và `-----END ... KEY-----`)
- Giữ nguyên format và line breaks

### Bước 2: Cấu hình GitLab Runner (nếu sử dụng Self-hosted Runner)

#### 2.1. Cài đặt GitLab Runner

**Trên Linux:**
```bash
# Download
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash

# Install
sudo apt-get install gitlab-runner
```

**Trên macOS:**
```bash
brew install gitlab-runner
```

**Trên Windows:**
- Download từ: https://docs.gitlab.com/runner/install/windows.html

#### 2.2. Đăng ký Runner

```bash
# Chạy lệnh đăng ký
sudo gitlab-runner register

# Nhập các thông tin:
# - GitLab URL: https://gitlab.com (hoặc GitLab instance của bạn)
# - Registration token: Lấy từ Settings → CI/CD → Runners
# - Description: docker-runner
# - Tags: docker
# - Executor: docker
# - Default Docker image: docker:24-dind
```

#### 2.3. Cấu hình Runner để sử dụng Docker-in-Docker

Chỉnh sửa file `/etc/gitlab-runner/config.toml`:

```toml
[[runners]]
  name = "docker-runner"
  url = "https://gitlab.com"
  token = "YOUR_TOKEN"
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "docker:24-dind"
    privileged = true
    disable_cache = false
    volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
    shm_size = 0
```

Khởi động lại Runner:
```bash
sudo gitlab-runner restart
```

### Bước 3: Tạo branch 'gitlab' và push code

```bash
# Tạo branch mới
git checkout -b gitlab

# Add file .gitlab-ci.yml
git add .gitlab-ci.yml

# Commit
git commit -m "Add GitLab CI/CD pipeline configuration"

# Add remote GitLab (nếu chưa có)
git remote add gitlab https://gitlab.com/your-username/your-repo.git

# Push code
git push gitlab gitlab
```

### Bước 4: Chuẩn bị VPS

#### 4.1. Cài đặt Docker và Docker Compose trên VPS

```bash
# SSH vào VPS
ssh your-user@your-vps-ip

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 4.2. Clone repository trên VPS

```bash
# Tạo thư mục
sudo mkdir -p /var/www/graphQL-project
cd /var/www/graphQL-project

# Clone repo (sử dụng Deploy Token hoặc SSH)
git clone https://gitlab.com/your-username/your-repo.git .

# Checkout branch gitlab
git checkout gitlab

# Cấp quyền cho deploy script
chmod +x deploy.sh
```

#### 4.3. Setup SSH Key cho GitLab Runner

```bash
# Trên máy local, tạo SSH key pair
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@your-project" -f ~/.ssh/gitlab_ci_rsa

# Copy public key lên VPS
ssh-copy-id -i ~/.ssh/gitlab_ci_rsa.pub your-user@your-vps-ip

# Copy private key để add vào GitLab Variables
cat ~/.ssh/gitlab_ci_rsa
# Copy toàn bộ output và paste vào GitLab Variable VPS_KEY
```

### Bước 5: Sử dụng GitLab Container Registry (Tùy chọn)

Nếu bạn muốn sử dụng GitLab Container Registry thay vì registry riêng:

1. Enable Container Registry trong **Settings → General → Visibility**
2. Cập nhật biến trong `.gitlab-ci.yml`:
   - `REGISTRY_URL`: `$CI_REGISTRY`
   - `REGISTRY_USER`: `$CI_REGISTRY_USER`
   - `REGISTRY_PASS`: `$CI_REGISTRY_PASSWORD`

Những biến này được GitLab cung cấp sẵn, không cần config thêm.

## 🚀 Test Pipeline

1. Push code lên branch `gitlab`:
```bash
git push gitlab gitlab
```

2. Vào **CI/CD → Pipelines** để xem tiến trình

3. Pipeline sẽ chạy qua các stage:
   - **Build stage**: Build 3 Docker images song song
   - **Deploy stage**: Deploy lên VPS

## 📊 So sánh GitLab CI/CD vs GitHub Actions

| Feature | GitLab CI/CD | GitHub Actions |
|---------|--------------|----------------|
| Config file | `.gitlab-ci.yml` | `.github/workflows/*.yml` |
| Stages | `stages` keyword | `jobs` với `needs` |
| Secrets | CI/CD Variables | Repository Secrets |
| Built-in Registry | ✅ GitLab Container Registry | ✅ GitHub Container Registry |
| Self-hosted runner | GitLab Runner | GitHub Runner |
| Parallel jobs | Tự động nếu cùng stage | Tự động nếu không có `needs` |

## 🔍 Troubleshooting

### Lỗi: "docker: command not found" trong pipeline

**Giải pháp:** Đảm bảo sử dụng `docker:24-dind` image và service.

### Lỗi: SSH connection refused

**Giải pháp:** 
- Kiểm tra VPS_HOST, VPS_USER đúng chưa
- Kiểm tra SSH key đã add vào VPS chưa
- Kiểm tra firewall VPS có mở port 22 không

### Lỗi: Permission denied trên VPS

**Giải pháp:**
```bash
# Thêm user vào docker group
sudo usermod -aG docker $USER

# Hoặc chạy với sudo
sudo ./deploy.sh
```

### Pipeline không chạy

**Giải pháp:**
- Kiểm tra GitLab Runner đã active chưa (Settings → CI/CD → Runners)
- Kiểm tra branch name có đúng là `gitlab` không (trong `.gitlab-ci.yml` có `only: - gitlab`)
- Kiểm tra `.gitlab-ci.yml` syntax bằng **CI/CD → Editor → Validate**

## 📚 Tài liệu tham khảo

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab Runner Installation](https://docs.gitlab.com/runner/install/)
- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)
