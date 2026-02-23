import express from 'express';
import crypto from 'crypto';
import Tenant from '../models/Tenant.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, ensureTenantMember } from '../middleware/tenantMiddleware.js';
import { isStoreOwner } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// API Key Model (in-memory for now, should be in database)
const apiKeys = new Map();

// Generate API key
export const generateApiKey = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Generate secure API key
    const apiKey = `sk_${req.tenant._id.toString().slice(0, 8)}_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Store API key (in production, store in database)
    apiKeys.set(hashedKey, {
      tenantId: req.tenant._id,
      name: name || 'Default API Key',
      permissions: permissions || ['read', 'write'],
      createdAt: new Date(),
      lastUsed: null
    });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      apiKey, // Only shown once
      name: name || 'Default API Key',
      permissions: permissions || ['read', 'write']
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating API key'
    });
  }
};

// List API keys
export const listApiKeys = async (req, res) => {
  try {
    const keys = [];

    for (const [hash, data] of apiKeys.entries()) {
      if (data.tenantId.toString() === req.tenant._id.toString()) {
        keys.push({
          id: hash.slice(0, 16),
          name: data.name,
          permissions: data.permissions,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed
        });
      }
    }

    res.status(200).json({
      success: true,
      apiKeys: keys
    });
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing API keys'
    });
  }
};

// Revoke API key
export const revokeApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    let found = false;
    for (const [hash, data] of apiKeys.entries()) {
      if (hash.startsWith(keyId) && data.tenantId.toString() === req.tenant._id.toString()) {
        apiKeys.delete(hash);
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking API key'
    });
  }
};

// Middleware to verify API key
export const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyData = apiKeys.get(hashedKey);

    if (!keyData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // Update last used
    keyData.lastUsed = new Date();

    // Get tenant
    const tenant = await Tenant.findById(keyData.tenantId);
    if (!tenant || !tenant.canAccess()) {
      return res.status(403).json({
        success: false,
        message: 'Store is not accessible'
      });
    }

    req.tenant = tenant;
    req.apiKeyPermissions = keyData.permissions;
    next();
  } catch (error) {
    console.error('API key verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying API key'
    });
  }
};

// Routes
router.post('/keys', protect, extractTenant, ensureTenantMember, isStoreOwner, generateApiKey);
router.get('/keys', protect, extractTenant, ensureTenantMember, isStoreOwner, listApiKeys);
router.delete('/keys/:keyId', protect, extractTenant, ensureTenantMember, isStoreOwner, revokeApiKey);

export default router;
