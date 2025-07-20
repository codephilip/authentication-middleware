const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Middleware API',
    version: '1.0.0',
    description: 'Authentication and Authorization API documentation',
    contact: {
      name: 'Development Team',
      email: 'dev@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken'
      },
      refreshToken: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken'
      },
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-XSRF-TOKEN'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          email: { type: 'string', format: 'email' },
          roles: { 
            type: 'array',
            items: { type: 'string', enum: ['USER', 'ADMIN'] },
            default: ['USER']
          },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            default: ['READ']
          }
        },
        required: ['userId', 'email']
      },
      TokenResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          tokens: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' }
            }
          }
        }
      },
      UserData: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          roles: { 
            type: 'array',
            items: { type: 'string' }
          },
          permissions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          requestId: { type: 'string' }
        }
      }
    }
  },
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Protected', description: 'Protected API endpoints' },
    { name: 'System', description: 'System endpoints' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check endpoint',
        responses: {
          '200': {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login to get access tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              },
              example: {
                userId: "123",
                email: "user@example.com",
                roles: ["USER"],
                permissions: ["READ"]
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TokenResponse'
                }
              }
            }
          },
          '500': {
            description: 'Login failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and invalidate tokens',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'header',
            name: 'X-XSRF-TOKEN',
            schema: {
              type: 'string'
            },
            required: true,
            description: 'CSRF token'
          }
        ],
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Logged out successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/public': {
      get: {
        tags: ['Protected'],
        summary: 'Public endpoint (no authentication required)',
        responses: {
          '200': {
            description: 'Public endpoint response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Public endpoint' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/user': {
      get: {
        tags: ['Protected'],
        summary: 'Protected user endpoint',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'User data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/UserData' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/admin': {
      get: {
        tags: ['Protected'],
        summary: 'Admin endpoint (requires ADMIN_ACCESS permission)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Admin data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/UserData' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/limited': {
      get: {
        tags: ['Protected'],
        summary: 'Rate limited endpoint',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Rate limited endpoint response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Rate limited endpoint' }
                  }
                }
              }
            }
          },
          '429': {
            description: 'Too many requests',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    accessToken: { type: 'string' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token refresh failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/revoke': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke user tokens',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Tokens revoked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Tokens revoked' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Token revocation failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = { swaggerDocument }; 